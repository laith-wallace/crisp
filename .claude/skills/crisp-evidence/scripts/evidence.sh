#!/usr/bin/env bash
# evidence.sh - annotated runtime evidence recorder for /crisp-evidence
#
#   evidence.sh doctor
#   evidence.sh start <dir> [--title "..."] [--source auto|avfoundation|x11|none] [--screen-index N] [--environment "..."]
#   evidence.sh annotate <dir> --type setup|test_start|assertion [--result passed|failed|untested] --message "..."
#   evidence.sh stop <dir>
#
# Needs only bash, coreutils, git. Video needs ffmpeg + ffprobe with libx264 and the subtitles filter.
# With --source none (or no ffmpeg) the session still produces annotations.tsv, report.md, and manifest.json;
# pair it with numbered screenshots per the headless path in SKILL.md.

set -u

cmd="${1:-}"; shift || true

die() { echo "evidence: $*" >&2; exit 1; }
now() { date +%s; }
os() { case "$(uname -s)" in Darwin) echo darwin;; Linux) echo linux;; *) echo other;; esac; }

has_ffmpeg() { command -v ffmpeg >/dev/null 2>&1 && command -v ffprobe >/dev/null 2>&1; }
has_x264()   { ffmpeg -hide_banner -encoders 2>/dev/null | grep -q libx264; }
has_subs()   { ffmpeg -hide_banner -filters  2>/dev/null | grep -q ' subtitles '; }

mac_screen_index() {
  # First "Capture screen" device index from avfoundation's device list.
  ffmpeg -hide_banner -f avfoundation -list_devices true -i "" 2>&1 \
    | grep -i "capture screen" | head -1 | sed -E 's/.*\[([0-9]+)\].*/\1/'
}

detect_source() {
  case "$(os)" in
    darwin) idx="$(mac_screen_index)"; [ -n "$idx" ] && echo "avfoundation:$idx" || echo "none";;
    linux)  [ -n "${DISPLAY:-}" ] && echo "x11:${DISPLAY}" || echo "none";;
    *)      echo "none";;
  esac
}

case "$cmd" in
  doctor)
    ready=no; capture=no; src="none"
    if has_ffmpeg && has_x264 && has_subs; then ready=yes; fi
    if [ "$ready" = yes ]; then src="$(detect_source)"; [ "$src" != none ] && capture=yes; fi
    echo "ffmpeg: $(command -v ffmpeg || echo missing)"
    echo "ffprobe: $(command -v ffprobe || echo missing)"
    echo "libx264: $( has_ffmpeg && has_x264 && echo yes || echo no )"
    echo "subtitles_filter: $( has_ffmpeg && has_subs && echo yes || echo no )"
    echo "ready: $ready"
    echo "capture_ready: $capture"
    echo "source: $src"
    echo "os: $(os)"
    [ "$(os)" = darwin ] && echo "note: macOS needs Screen Recording permission for the terminal or agent host app"
    [ "$ready" = yes ] || exit 2
    ;;

  start)
    dir="${1:-}"; [ -n "$dir" ] || die "start needs <dir>"; shift
    title="evidence"; source="auto"; screen=""; env_desc=""
    while [ $# -gt 0 ]; do
      case "$1" in
        --title) title="$2"; shift 2;;
        --source) source="$2"; shift 2;;
        --screen-index) screen="$2"; shift 2;;
        --environment) env_desc="$2"; shift 2;;
        *) die "unknown flag $1";;
      esac
    done
    mkdir -p "$dir" || die "cannot create $dir"
    [ -f "$dir/session.env" ] && die "$dir already has a session - use a new directory"
    commit="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
    branch="$(git branch --show-current 2>/dev/null || echo unknown)"
    [ -n "$env_desc" ] || env_desc="$(uname -s) $(uname -m)"
    if [ "$source" = auto ]; then
      if has_ffmpeg; then source="$(detect_source)"; else source="none"; fi
    fi
    [ -n "$screen" ] && [ "${source%%:*}" = avfoundation ] && source="avfoundation:$screen"
    pid=""
    case "${source%%:*}" in
      avfoundation)
        idx="${source#*:}"
        nohup ffmpeg -hide_banner -loglevel error -y -f avfoundation -framerate 30 -capture_cursor 1 \
          -i "${idx}:none" -c:v libx264 -preset ultrafast -pix_fmt yuv420p "$dir/raw.ts" \
          >"$dir/ffmpeg.log" 2>&1 &
        pid=$!;;
      x11)
        disp="${source#*:}"
        nohup ffmpeg -hide_banner -loglevel error -y -f x11grab -framerate 30 -i "$disp" \
          -c:v libx264 -preset ultrafast -pix_fmt yuv420p "$dir/raw.ts" \
          >"$dir/ffmpeg.log" 2>&1 &
        pid=$!;;
      none) ;;
      *) die "unknown source $source";;
    esac
    {
      echo "START_EPOCH=$(now)"
      echo "TITLE=$(printf '%q' "$title")"
      echo "COMMIT=$commit"
      echo "BRANCH=$(printf '%q' "$branch")"
      echo "SOURCE=$source"
      echo "ENVIRONMENT=$(printf '%q' "$env_desc")"
      echo "RECORDER_PID=$pid"
    } > "$dir/session.env"
    : > "$dir/annotations.tsv"
    sleep 1
    if [ -n "$pid" ] && ! kill -0 "$pid" 2>/dev/null; then
      echo "warning: recorder exited immediately - see $dir/ffmpeg.log; continuing without video" >&2
      sed -i.bak 's/^SOURCE=.*/SOURCE=none/; s/^RECORDER_PID=.*/RECORDER_PID=/' "$dir/session.env" && rm -f "$dir/session.env.bak"
      source="none"
    fi
    echo "session: $dir"
    echo "source: $source"
    echo "commit: $commit ($branch)"
    ;;

  annotate)
    dir="${1:-}"; [ -n "$dir" ] || die "annotate needs <dir>"; shift
    [ -f "$dir/session.env" ] || die "no session in $dir"
    type=""; result="-"; msg=""
    while [ $# -gt 0 ]; do
      case "$1" in
        --type) type="$2"; shift 2;;
        --result) result="$2"; shift 2;;
        --message) msg="$2"; shift 2;;
        *) die "unknown flag $1";;
      esac
    done
    case "$type" in setup|test_start|assertion) ;; *) die "--type must be setup, test_start, or assertion";; esac
    [ -n "$msg" ] || die "--message is required"
    [ "${#msg}" -le 80 ] || die "message is ${#msg} chars - max 80, keep it high-signal"
    if [ "$type" = assertion ]; then
      case "$result" in passed|failed|untested) ;; *) die "assertion needs --result passed|failed|untested";; esac
    else
      result="-"
    fi
    # shellcheck disable=SC1090
    . "$dir/session.env"
    elapsed=$(( $(now) - START_EPOCH ))
    printf '%s\t%s\t%s\t%s\n' "$elapsed" "$type" "$result" "$msg" >> "$dir/annotations.tsv"
    echo "[$elapsed s] $type${result:+ $result}: $msg"
    ;;

  stop)
    dir="${1:-}"; [ -n "$dir" ] || die "stop needs <dir>"
    [ -f "$dir/session.env" ] || die "no session in $dir"
    # shellcheck disable=SC1090
    . "$dir/session.env"
    end=$(now); duration=$(( end - START_EPOCH ))
    if [ -n "${RECORDER_PID:-}" ] && kill -0 "$RECORDER_PID" 2>/dev/null; then
      kill -INT "$RECORDER_PID" 2>/dev/null
      for _ in 1 2 3 4 5 6 7 8 9 10; do kill -0 "$RECORDER_PID" 2>/dev/null || break; sleep 1; done
      kill -0 "$RECORDER_PID" 2>/dev/null && kill -TERM "$RECORDER_PID" 2>/dev/null
    fi
    # Subtitles: each annotation shows for 4 seconds.
    n=0; : > "$dir/annotations.srt"
    while IFS=$'\t' read -r t ty res m; do
      [ -n "$t" ] || continue
      n=$((n+1)); s=$t; e=$((t+4))
      fmt() { printf '%02d:%02d:%02d,000' $(($1/3600)) $((($1%3600)/60)) $(($1%60)); }
      label="$ty"; [ "$res" != "-" ] && label="$ty [$res]"
      printf '%d\n%s --> %s\n%s: %s\n\n' "$n" "$(fmt $s)" "$(fmt $e)" "$label" "$m" >> "$dir/annotations.srt"
    done < "$dir/annotations.tsv"
    verified=false; video=""
    if [ -f "$dir/raw.ts" ] && has_ffmpeg; then
      if ffmpeg -hide_banner -loglevel error -y -i "$dir/raw.ts" -vf "subtitles=$dir/annotations.srt" \
           -c:v libx264 -preset fast -pix_fmt yuv420p -movflags +faststart "$dir/evidence.mp4" 2>>"$dir/ffmpeg.log"; then
        if ffprobe -v error -show_entries format=duration -of csv=p=0 "$dir/evidence.mp4" >/dev/null 2>&1; then
          verified=true; video="evidence.mp4"
        fi
      fi
    fi
    passed=$(awk -F'\t' '$2=="assertion"&&$3=="passed"' "$dir/annotations.tsv" | wc -l | tr -d ' ')
    failed=$(awk -F'\t' '$2=="assertion"&&$3=="failed"' "$dir/annotations.tsv" | wc -l | tr -d ' ')
    untested=$(awk -F'\t' '$2=="assertion"&&$3=="untested"' "$dir/annotations.tsv" | wc -l | tr -d ' ')
    {
      echo "# Evidence: $TITLE"
      echo
      echo "- Commit: \`$COMMIT\` on \`$BRANCH\`"
      echo "- Environment: $ENVIRONMENT"
      echo "- Source: $SOURCE"
      echo "- Duration: ${duration}s"
      echo "- Video: ${video:-none (headless path - see numbered captures in this folder)}"
      echo "- Result: $passed passed, $failed failed, $untested untested"
      echo
      echo "| t (s) | Type | Result | Message |"
      echo "|---|---|---|---|"
      awk -F'\t' '{ printf "| %s | %s | %s | %s |\n", $1, $2, $3, $4 }' "$dir/annotations.tsv"
      echo
      echo "## Caveats"
      echo
      echo "TODO: replace this line. State what was not tested and why, and anything the reader should know before trusting the result."
    } > "$dir/report.md"
    {
      echo "{"
      echo "  \"title\": \"$TITLE\","
      echo "  \"commit\": \"$COMMIT\","
      echo "  \"branch\": \"$BRANCH\","
      echo "  \"source\": \"$SOURCE\","
      echo "  \"duration_seconds\": $duration,"
      echo "  \"video\": $( [ -n "$video" ] && echo "\"$video\"" || echo null ),"
      echo "  \"verified\": $verified,"
      echo "  \"passed\": $passed, \"failed\": $failed, \"untested\": $untested"
      echo "}"
    } > "$dir/manifest.json"
    echo "report: $dir/report.md"
    echo "verified: $verified"
    echo "result: $passed passed, $failed failed, $untested untested"
    [ "$failed" -eq 0 ] || exit 3
    ;;

  *)
    sed -n '2,10p' "$0"; exit 1;;
esac

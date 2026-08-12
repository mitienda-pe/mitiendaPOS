#!/usr/bin/env bash
#
# Genera CHANGELOG.md a partir de los conventional commits del repo.
#
# Uso:
#   scripts/changelog.sh              # regenera CHANGELOG.md
#   scripts/changelog.sh --stdout     # lo imprime sin escribir el archivo
#   scripts/changelog.sh --all        # incluye chore/docs/test/debug (ruido)
#
# Los releases se agrupan por tag CalVer (vAAAA.MM.N). Los commits posteriores
# al ultimo tag caen en "Sin publicar"; los anteriores al primer tag quedan en
# el historico, agrupados por mes.
#
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

OUTPUT="CHANGELOG.md"
INCLUDE_ALL=0

# Esquema de versionado. scripts/release.conf lo puede cambiar por repo.
SCHEME=calver
[ -f scripts/release.conf ] && . ./scripts/release.conf

case "$SCHEME" in
  calver)
    TAG_GLOB='v[0-9][0-9][0-9][0-9].[0-9][0-9].*'
    TAG_RE='^v[0-9]{4}\.[0-9]{2}\.[0-9]+$'
    ;;
  semver)
    TAG_GLOB='v[0-9]*'
    TAG_RE='^v[0-9]+\.[0-9]+\.[0-9]+$'
    ;;
  *) echo "SCHEME desconocido: $SCHEME" >&2; exit 1 ;;
esac

while [ $# -gt 0 ]; do
  case "$1" in
    --all)    INCLUDE_ALL=1 ;;
    --stdout) OUTPUT="-" ;;
    --output) OUTPUT="${2:?falta la ruta}"; shift ;;
    -h|--help) sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "opcion desconocida: $1" >&2; exit 1 ;;
  esac
  shift
done

# URL del repo en GitHub, para enlazar cada commit. Soporta el remoto https y
# el ssh con host alias (git@github.com-mitienda:owner/repo.git).
REPO_URL=""
remote_url="$(git remote get-url origin 2>/dev/null || true)"
case "$remote_url" in
  *github.com*)
    path="${remote_url%.git}"
    path="${path##*github.com}"
    path="${path##*:}"
    path="${path#/}"
    [ -n "$path" ] && REPO_URL="https://github.com/$path"
    ;;
esac

# ---------------------------------------------------------------------------
# Formateador: lee `git log` por stdin y emite las secciones por tipo.
# ---------------------------------------------------------------------------
format_commits() {
  local range="$1" by_month="$2"
  git log --no-merges --date=short \
      --format='%H%x1f%ad%x1f%s%x1f%b%x1e' $range 2>/dev/null |
  awk -v include_all="$INCLUDE_ALL" -v repo_url="$REPO_URL" -v by_month="$by_month" '
    BEGIN {
      RS = "\036"; FS = "\037"

      mes["01"]="Enero";  mes["02"]="Febrero";   mes["03"]="Marzo"
      mes["04"]="Abril";  mes["05"]="Mayo";      mes["06"]="Junio"
      mes["07"]="Julio";  mes["08"]="Agosto";    mes["09"]="Septiembre"
      mes["10"]="Octubre";mes["11"]="Noviembre"; mes["12"]="Diciembre"

      ngroups = 0
      order[++ngroups] = "breaking"; titulo["breaking"] = "Cambios incompatibles"
      order[++ngroups] = "feat";     titulo["feat"]     = "Novedades"
      order[++ngroups] = "fix";      titulo["fix"]      = "Correcciones"
      order[++ngroups] = "perf";     titulo["perf"]     = "Rendimiento"
      order[++ngroups] = "revert";   titulo["revert"]   = "Reversiones"
      order[++ngroups] = "refactor"; titulo["refactor"] = "Refactor"
      order[++ngroups] = "otros";    titulo["otros"]    = "Otros"

      nbuckets = 0
    }

    {
      hash = $1; fecha = $2; subject = $3; body = $4
      sub(/^\n+/, "", hash)
      if (hash == "" || subject == "") next

      type = ""; scope = ""; breaking = 0; msg = subject

      if (match(subject, /^[a-zA-Z]+(\([^)]*\))?!?: /)) {
        head = substr(subject, 1, RLENGTH - 2)
        msg  = substr(subject, RLENGTH + 1)
        if (head ~ /!$/) { breaking = 1; sub(/!$/, "", head) }
        if (match(head, /\([^)]*\)$/)) {
          scope = substr(head, RSTART + 1, RLENGTH - 2)
          head  = substr(head, 1, RSTART - 1)
        }
        type = tolower(head)
      }
      if (body ~ /BREAKING[ -]CHANGE/) breaking = 1

      if (breaking)                 group = "breaking"
      else if (type == "feat")      group = "feat"
      else if (type == "fix")       group = "fix"
      else if (type == "perf")      group = "perf"
      else if (type == "revert")    group = "revert"
      else if (type == "refactor")  group = "refactor"
      else if (include_all == 1)    group = "otros"
      else                          next

      periodo = by_month == 1 ? substr(fecha, 1, 7) : "_"
      if (!(periodo in visto_periodo)) {
        visto_periodo[periodo] = 1
        periodos[++nperiodos] = periodo
      }

      # Un mismo mensaje repetido (reintentos, cherry-picks) se lista una vez.
      dedupe_key = periodo SUBSEP group SUBSEP scope SUBSEP msg
      if (dedupe_key in visto_msg) next
      visto_msg[dedupe_key] = 1

      linea = "- "
      if (scope != "") linea = linea "**" scope ":** "
      linea = linea msg
      corto = substr(hash, 1, 7)
      if (repo_url != "")
        linea = linea " ([`" corto "`](" repo_url "/commit/" hash "))"
      else
        linea = linea " (`" corto "`)"

      bucket = periodo SUBSEP group
      if (!(bucket in cuenta)) { cuenta[bucket] = 0; nbuckets++ }
      lineas[bucket, ++cuenta[bucket]] = linea
    }

    END {
      if (nbuckets == 0) exit 0
      for (p = 1; p <= nperiodos; p++) {
        periodo = periodos[p]
        if (by_month == 1) {
          anio = substr(periodo, 1, 4); mm = substr(periodo, 6, 2)
          printf "## %s %s\n\n", mes[mm], anio
        }
        for (g = 1; g <= ngroups; g++) {
          bucket = periodo SUBSEP order[g]
          if (!(bucket in cuenta)) continue
          printf "### %s\n\n", titulo[order[g]]
          for (i = 1; i <= cuenta[bucket]; i++) print lineas[bucket, i]
          printf "\n"
        }
      }
    }
  '
}

# ---------------------------------------------------------------------------
# Armado del documento
# ---------------------------------------------------------------------------
tags=""
for t in $(git tag --list "$TAG_GLOB" --sort=-v:refname); do
  echo "$t" | grep -Eq "$TAG_RE" && tags="$tags $t"
done

doc="$(mktemp)"
trap 'rm -f "$doc"' EXIT

{
  echo "# Changelog"
  echo
  echo "Generado con \`scripts/changelog.sh\` desde los conventional commits."
  echo "No editar a mano: los cambios se pierden en la siguiente regeneracion."
  echo
} > "$doc"

newest_tag="$(echo $tags | awk '{print $1}')"
oldest_tag="$(echo $tags | awk '{print $NF}')"

# Sin publicar: commits posteriores al ultimo tag.
if [ -n "$newest_tag" ]; then
  pending="$(format_commits "${newest_tag}..HEAD" 0)"
  if [ -n "$pending" ]; then
    {
      echo "## Sin publicar"
      echo
      echo "$pending"
      echo
    } >> "$doc"
  fi
fi

# Un bloque por release, de mas nuevo a mas viejo. El rango de cada uno va
# desde el tag anterior (el siguiente en esta lista) hasta el propio tag.
i=0
for t in $tags; do
  i=$((i + 1))
  prev_tag="$(echo $tags | awk -v n=$((i + 1)) '{print $n}')"
  fecha="$(git log -1 --format=%ad --date=short "$t")"
  {
    echo "## [$t] - $fecha"
    echo
  } >> "$doc"

  if [ -z "$prev_tag" ]; then
    # El tag mas viejo es la primera version etiquetada: todo lo que la precede
    # es el historico, que se lista aparte y agrupado por mes.
    {
      echo "Primera version etiquetada. Lo anterior esta en el historico."
      echo
    } >> "$doc"
    continue
  fi

  body="$(format_commits "${prev_tag}..${t}" 0)"
  if [ -n "$body" ]; then
    { echo "$body"; echo; } >> "$doc"
  else
    { echo "_Sin cambios relevantes._"; echo; } >> "$doc"
  fi
done

# Historico: todo lo anterior al primer tag, agrupado por mes.
if [ -n "$oldest_tag" ]; then
  hist="$(format_commits "${oldest_tag}" 1)"
else
  hist="$(format_commits "HEAD" 1)"
fi

if [ -n "$hist" ]; then
  if [ -n "$oldest_tag" ]; then
    {
      echo "---"
      echo
      echo "# Historico (previo al versionado)"
      echo
    } >> "$doc"
  fi
  { echo "$hist"; echo; } >> "$doc"
fi

if [ "$OUTPUT" = "-" ]; then
  cat "$doc"
else
  # `cat >` y no `cp`, para no heredar el 0600 del mktemp.
  cat "$doc" > "$OUTPUT"
  echo "✓ $OUTPUT ($(grep -c '^- ' "$OUTPUT") entradas, $(wc -l < "$OUTPUT" | tr -d ' ') lineas)"
fi

#!/usr/bin/env bash
#
# Corta un release: calcula la version, regenera el CHANGELOG, commitea y crea
# el tag anotado. El deploy queda aparte salvo que pases --push.
#
# Uso:
#   scripts/release.sh                    # commit + tag locales, imprime que falta
#   scripts/release.sh --push             # ademas pushea y despliega (pide confirmacion)
#   scripts/release.sh --dry-run          # solo muestra que version saldria
#   scripts/release.sh minor              # (solo semver) major | minor | patch
#
# El esquema de versionado se define en scripts/release.conf:
#   SCHEME=calver  -> vAAAA.MM.N, N calculado por el script (apps sin version
#                     visible al usuario: la API, mtservicios)
#   SCHEME=semver  -> vX.Y.Z leido de VERSION_FILE (fronts con aviso de "hay
#                     version nueva", que consume ese numero)
#
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

# --- Config por repo -------------------------------------------------------
SCHEME=calver
VERSION_FILE=""
DEPLOY_PUSH=""
[ -f scripts/release.conf ] && . ./scripts/release.conf

DO_PUSH=0
DRY_RUN=0
BUMP=patch

while [ $# -gt 0 ]; do
  case "$1" in
    --push)    DO_PUSH=1 ;;
    --dry-run) DRY_RUN=1 ;;
    major|minor|patch) BUMP="$1" ;;
    -h|--help) sed -n '2,17p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "opcion desconocida: $1" >&2; exit 1 ;;
  esac
  shift
done

die() { echo "✗ $*" >&2; exit 1; }

# --- Guardas ---------------------------------------------------------------
branch="$(git rev-parse --abbrev-ref HEAD)"
[ "$branch" = "main" ] || die "estas en '$branch'; los releases se cortan desde main"

if [ -n "$(git status --porcelain)" ]; then
  git status --short >&2
  die "el working tree tiene cambios sin commitear"
fi

[ -x scripts/changelog.sh ] || die "falta scripts/changelog.sh"

# --- Siguiente version -----------------------------------------------------
read_version_file() {
  awk '/^[[:space:]]*"version"[[:space:]]*:/ {
         if (match($0, /"[0-9][^"]*"/)) {
           print substr($0, RSTART + 1, RLENGTH - 2); exit
         }
       }' "$VERSION_FILE"
}

write_version_file() {
  awk -v v="$1" 'BEGIN { done = 0 }
       !done && /^[[:space:]]*"version"[[:space:]]*:/ {
         if (sub(/"[0-9][^"]*"/, "\"" v "\"")) done = 1
       }
       { print }' "$VERSION_FILE" > "$VERSION_FILE.tmp"
  cat "$VERSION_FILE.tmp" > "$VERSION_FILE"   # preserva permisos del original
  rm -f "$VERSION_FILE.tmp"
}

bump_semver() {
  major="${1%%.*}"; rest="${1#*.}"
  minor="${rest%%.*}"; patch="${rest#*.}"
  patch="${patch%%[-+]*}"   # descarta sufijos tipo -rc1
  case "$2" in
    major) major=$((major + 1)); minor=0; patch=0 ;;
    minor) minor=$((minor + 1)); patch=0 ;;
    patch) patch=$((patch + 1)) ;;
  esac
  echo "$major.$minor.$patch"
}

adopt=0

case "$SCHEME" in
  calver)
    tag_glob='v[0-9][0-9][0-9][0-9].[0-9][0-9].*'
    prefix="v$(date +%Y.%m)"
    max=0
    for t in $(git tag --list "$prefix.*"); do
      n="${t##*.}"
      case "$n" in ''|*[!0-9]*) continue ;; esac
      [ "$n" -gt "$max" ] && max="$n"
    done
    version="$prefix.$((max + 1))"
    detalle="CalVer, release $((max + 1)) del mes"
    ;;
  semver)
    tag_glob='v[0-9]*'
    [ -n "$VERSION_FILE" ] || die "SCHEME=semver requiere VERSION_FILE en scripts/release.conf"
    [ -f "$VERSION_FILE" ] || die "no existe $VERSION_FILE"
    current="$(read_version_file)"
    [ -n "$current" ] || die "no pude leer la version de $VERSION_FILE"
    if git rev-parse -q --verify "refs/tags/v$current" >/dev/null; then
      version="v$(bump_semver "$current" "$BUMP")"
      detalle="semver, bump $BUMP desde $current"
    else
      # La version ya se subio a mano en $VERSION_FILE y nunca se etiqueto:
      # se adopta tal cual en vez de saltarsela.
      version="v$current"
      adopt=1
      detalle="semver, adopta el $current que ya estaba en $VERSION_FILE"
    fi
    ;;
  *) die "SCHEME desconocido: $SCHEME" ;;
esac

last_tag="$(git tag --list "$tag_glob" --sort=-v:refname | head -1)"

if [ -n "$last_tag" ]; then
  n_commits="$(git rev-list --count --no-merges "${last_tag}..HEAD")"
  [ "$n_commits" -gt 0 ] || die "no hay commits nuevos desde $last_tag"
else
  n_commits="$(git rev-list --count --no-merges HEAD)"
fi

echo "Release:  $version  ($detalle)"
echo "Anterior: ${last_tag:-(ninguno, primer release)}"
echo "Commits:  $n_commits"
echo

# Aviso: el hook de deploy NO corre migraciones. Si el release trae migraciones
# nuevas hay que aplicarlas ANTES de que el codigo nuevo entre a produccion.
if [ -d app/Database/Migrations ] && [ -n "$last_tag" ]; then
  migrations="$(git diff --name-only --diff-filter=A "$last_tag" HEAD -- app/Database/Migrations 2>/dev/null || true)"
  if [ -n "$migrations" ]; then
    echo "⚠ Este release trae migraciones nuevas:"
    echo "$migrations" | sed 's/^/    /'
    echo "  Corrélas ANTES del deploy: php spark migrate -g mitienda"
    echo
  fi
fi

if [ "$DRY_RUN" = "1" ]; then
  echo "(--dry-run: no se toco nada)"
  exit 0
fi

# --- Version + changelog + tag ---------------------------------------------
if [ "$SCHEME" = "semver" ] && [ "$adopt" = "0" ]; then
  write_version_file "${version#v}"
fi

# El tag se crea primero para que el changelog agrupe estos commits bajo el
# release; despues se mueve al commit del changelog.
git tag -a "$version" -m "Release $version" >/dev/null
rollback() {
  git tag -d "$version" >/dev/null 2>&1 || true
  [ -n "$VERSION_FILE" ] && git checkout -q -- "$VERSION_FILE" 2>/dev/null || true
}
trap rollback EXIT

./scripts/changelog.sh >/dev/null

if [ -z "$(git status --porcelain)" ]; then
  die "no cambio ni el changelog ni la version; revisa scripts/changelog.sh"
fi

git add CHANGELOG.md
if [ -n "$VERSION_FILE" ]; then
  git add "$VERSION_FILE"
fi
git commit -q -m "chore(release): $version"
git tag -f -a "$version" -m "Release $version" >/dev/null
trap - EXIT

echo "✓ commit + tag $version creados"
echo

# --- Push / deploy ---------------------------------------------------------
if [ -z "$DEPLOY_PUSH" ] && git remote | grep -qx live; then
  DEPLOY_PUSH="live main:master"
fi

if [ "$DO_PUSH" != "1" ]; then
  echo "Falta publicar:"
  echo "    git push origin main --follow-tags"
  [ -n "$DEPLOY_PUSH" ] && echo "    git push $DEPLOY_PUSH   # deploy a produccion"
  echo
  echo "O reejecuta con --push."
  exit 0
fi

echo "Se va a pushear a origin y desplegar a PRODUCCION."
printf "¿Continuar? [y/N] "
read -r answer < /dev/tty
case "$answer" in
  [yY]*) ;;
  *) echo "Cancelado. El commit y el tag quedan locales."; exit 1 ;;
esac

git push origin main --follow-tags
if [ -n "$DEPLOY_PUSH" ]; then
  git push $DEPLOY_PUSH
  echo "✓ desplegado a produccion ($version)"
else
  echo "✓ pusheado a origin; el deploy lo dispara el push ($version)"
fi

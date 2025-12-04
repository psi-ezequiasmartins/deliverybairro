```markdown
# APK local (Android SDK) — resumo rápido
Arquivo de referência para gerar um APK local a partir de um projeto Expo managed (para executar em sua máquina com Android SDK instalado).

## Requisitos (máquina local)
- Node >= 18, npm ou yarn
- JDK (recomendado Temurin/Adoptium 17)
- Android SDK (command line tools + platform-tools + build-tools + platform)
- Variáveis de ambiente: JAVA_HOME, ANDROID_SDK_ROOT (ou ANDROID_HOME)

Exemplo (adicione ao `~/.bashrc` ou `~/.profile`):
```bash
export JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"
export ANDROID_SDK_ROOT="$HOME/Android/Sdk"
export PATH="$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$PATH"
```

## Instalação básica no Ubuntu (exemplo)
```bash
# JDK
sudo apt update
sudo apt install -y openjdk-17-jdk

# criar pasta do SDK
mkdir -p $HOME/Android/Sdk

# baixar command-line tools (site Android) e extrair
# (faça download manual se preferir; abaixo é um exemplo com curl)
curl -o cmdline-tools.zip https://dl.google.com/android/repository/commandlinetools-linux-XXXX_latest.zip
unzip cmdline-tools.zip -d $HOME/Android/Sdk/cmdline-tools
# mover/expor para .../cmdline-tools/latest (conforme sdkmanager espera)
mkdir -p $HOME/Android/Sdk/cmdline-tools/latest
mv $HOME/Android/Sdk/cmdline-tools/cmdline-tools/* $HOME/Android/Sdk/cmdline-tools/latest/

# usar sdkmanager para instalar plataformas e build-tools
sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.2"
```
(Substitua versões conforme necessidade do seu projeto / target SDK.)

## Passos no projeto Expo managed
1. Instalar dependências JS
```bash
cd /path/to/UserApp-OLD
npm install
```
2. Gerar código nativo (cria a pasta `android/`)
```bash
npx expo prebuild --platform android
```
3. (Opcional) Testar em device/emulador
```bash
npx expo run:android
```
4. Gerar APK de release com Gradle
```bash
cd android
chmod +x ./gradlew
./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk
```

## Assinatura (keystore)
Gerar keystore:
```bash
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```
Configurar `android/gradle.properties` (exemplo seguro via variáveis):
```properties
MYAPP_UPLOAD_STORE_FILE=my-release-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=senha_do_keystore
MYAPP_UPLOAD_KEY_PASSWORD=senha_da_chave
```
E referenciar no `android/app/build.gradle` na `signingConfigs` (expo prebuild costuma gerar instrução comentada sobre isso).

Dica: mantenha o `.keystore` e senhas fora do repositório; use secrets do CI quando automatizar.

## Problemas comuns
- "command not found: sdkmanager": command-line tools não instalados ou PATH incorreto.
- Falha por falta de dependências em `devDependencies`: durante build local o npm instala tudo localmente, mas CI com NODE_ENV=production precisa de `NPM_CONFIG_PRODUCTION=false`.
- Em ambiente Codespace/devcontainer: normalmente NÃO há Android SDK — faça o build na sua máquina local ou num CI com Android SDK instalado.

## Saída e distribuição
- APK debug vs release: release exige assinatura; release recomendado para Play Store (ou gerar AAB via `./gradlew bundleRelease`).
- Caminho do artefato: `android/app/build/outputs/apk/release/app-release.apk`
- Para publicar: use Play Console (AAB preferido).

---

Se quiser, eu gero um exemplo mínimo de `android/gradle.properties` + trecho `signingConfigs` para colar no seu projeto, ou um workflow do GitHub Actions que constrói e entrega o APK.
---
GitHub Copilot

Aqui está um workflow do GitHub Actions (em pt‑br) que gera um APK Android a partir de um projeto Expo managed, executa a prebuild, gera o APK com Gradle, assina (se você fornecer a keystore via secrets) e publica o artefato. Salve como .github/workflows/android-build.yml no repositório.

Observações rápidas:
- Forneça os secrets (no repositório): KEYSTORE_BASE64 (arquivo .keystore em base64), KEYSTORE_ALIAS, KEYSTORE_PASSWORD, KEY_PASSWORD. Se não quiser assinar, não defina esses secrets — o workflow ainda gerará o APK unsigned.
- Garante instalação de devDependencies com NPM_CONFIG_PRODUCTION=false.
- Ajuste android platform / build-tools se precisar (versões).

````yaml
name: Android APK (Gradle) Build

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-android:
    runs-on: ubuntu-latest
    env:
      ANDROID_HOME: ${{ env.ANDROID_SDK_ROOT }}
    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Cache Gradle
        uses: actions/cache@v4
        with:
          path: |
            ~/.gradle/caches
            ~/.gradle/wrapper
          key: gradle-cache-${{ runner.os }}-${{ hashFiles('**/android/gradle/wrapper/gradle-wrapper.properties') }}

      - name: Setup Java (Temurin 17)
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '17'

      - name: Ensure Android build tools (sdkmanager)
        run: |
          echo "ANDROID_SDK_ROOT=$ANDROID_SDK_ROOT"
          yes | $ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager --sdk_root=${ANDROID_SDK_ROOT} "platform-tools" "platforms;android-33" "build-tools;33.0.2"
        shell: bash

      - name: Install NPM dependencies (including devDependencies)
        run: |
          cd UserApp-OLD
          export NPM_CONFIG_PRODUCTION=false
          npm ci
        working-directory: ./UserApp-OLD

      - name: Expo prebuild (generate native projects)
        run: |
          cd UserApp-OLD
          npx expo prebuild --platform android --non-interactive
        working-directory: ./UserApp-OLD

      - name: Build APK (assembleRelease)
        run: |
          cd UserApp-OLD/android
          chmod +x ./gradlew
          ./gradlew assembleRelease -Porg.gradle.jvmargs="-Xmx3g"
        working-directory: ./UserApp-OLD/android

      - name: Locate build artifacts
        id: find_artifact
        run: |
          cd UserApp-OLD/android/app/build/outputs/apk/release
          echo "files:"
          ls -la
          # prefer unsigned name, fallback to regular
          if [ -f app-release-unsigned.apk ]; then
            echo "apk=app-release-unsigned.apk" >> $GITHUB_OUTPUT
          elif [ -f app-release.apk ]; then
            echo "apk=app-release.apk" >> $GITHUB_OUTPUT
          else
            echo "apk=" >> $GITHUB_OUTPUT
          fi

      - name: Sign & align APK (optional, if keystore provided)
        if: ${{ secrets.KEYSTORE_BASE64 != '' }}
        run: |
          set -e
          cd UserApp-OLD/android/app/build/outputs/apk/release
          APK_IN=${{ steps.find_artifact.outputs.apk }}
          if [ -z "$APK_IN" ]; then
            echo "APK não encontrado, abortando assinatura"
            exit 1
          fi

          # decode keystore
          echo "${{ secrets.KEYSTORE_BASE64 }}" | base64 --decode > my-release-key.keystore
          chmod 600 my-release-key.keystore

          # determine build-tools path
          BUILD_TOOLS=$(ls $ANDROID_SDK_ROOT/build-tools | sort -V | tail -n 1)
          ZIPALIGN=$ANDROID_SDK_ROOT/build-tools/$BUILD_TOOLS/zipalign
          APKSIGNER=$ANDROID_SDK_ROOT/build-tools/$BUILD_TOOLS/apksigner

          # paths
          APK_ALIGNED=app-release-unsigned-aligned.apk
          APK_SIGNED=app-release-signed.apk

          # zipalign (required before signing)
          $ZIPALIGN -v -p 4 "$APK_IN" "$APK_ALIGNED"

          # sign
          $APKSIGNER sign --ks my-release-key.keystore \
            --ks-key-alias "${{ secrets.KEYSTORE_ALIAS }}" \
            --ks-pass pass:"${{ secrets.KEYSTORE_PASSWORD }}" \
            --key-pass pass:"${{ secrets.KEY_PASSWORD }}" \
            --out "$APK_SIGNED" "$APK_ALIGNED"

          # final artifact
          mv "$APK_SIGNED" app-release-final.apk
        shell: bash

      - name: Prepare artifact (unsigned fallback)
        run: |
          cd UserApp-OLD/android/app/build/outputs/apk/release
          if [ -f app-release-final.apk ]; then
            echo "Using signed APK"
            ART=app-release-final.apk
          else
            # prefer assembled APK (signed by Gradle if configured) or unsigned
            if [ -f app-release.apk ]; then
              ART=app-release.apk
            elif [ -f app-release-unsigned.apk ]; then
              ART=app-release-unsigned.apk
            else
              echo "Nenhum APK encontrado"
              exit 1
            fi
          fi
          echo "artifact=$ART" >> $GITHUB_OUTPUT
        id: artifact
        shell: bash

      - name: Upload APK artifact
        uses: actions/upload-artifact@v4
        with:
          name: android-apk
          path: UserApp-OLD/android/app/build/outputs/apk/release/${{ steps.artifact.outputs.artifact }}
          retention-days: 7
````

Se quiser, ajusto o workflow para:
- Gerar AAB (bundleRelease) em vez de APK.
- Incluir step para publicar direto no Google Play via fastlane ou action do Play Store (requer service account).
- Adaptar para usar yarn ou pnpm.
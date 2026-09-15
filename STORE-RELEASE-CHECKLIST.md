# FlashMarket — checklist Google Play + App Store

## Identidade do aplicativo

- Nome: **FlashMarket**
- Android package / iOS Bundle ID: `br.flashmarket.app`
- Versão atual: `1.2.0`
- Android versionCode: `12000`
- iOS build: `12000`
- Cor principal: `#FFC21C`
- Fundo nativo: `#111111`
- Categoria sugerida: Shopping

## Estrutura nativa

O projeto usa Capacitor para transformar o frontend existente em aplicativos Android e iOS, mantendo o mesmo código web como camada de interface.

```bash
npm install
npx cap add android
npx cap add ios
```

Os recursos de ícone e splash são gerados com `@capacitor/assets`. A ferramenta aceita SVG no modo simples e gera os recursos nativos para Android/iOS/PWA. urlCapacitor Assetshttps://github.com/ionic-team/capacitor-assets

## Ícone e splash

Arquivos-fonte:

```text
assets/
├── logo.svg
└── logo-dark.svg
```

Gerar:

```bash
npm run mobile:assets
```

Android 12+ utiliza o modelo de splash screen do sistema. Para projetos com controle completo, as fontes recomendadas pelo Capacitor Assets são ícones de pelo menos 1024×1024 e splash de pelo menos 2732×2732. urlGuia de ícones e splash do Capacitorhttps://capacitorjs.com/docs/guides/splash-screens-and-icons

## Android

### Preparar

```bash
npm install
npx cap add android
npm run mobile:configure
npm run mobile:assets
npx cap sync android
```

### Abrir no Android Studio

```bash
npm run cap:android
```

### APK de teste

```powershell
cd android
.\gradlew.bat assembleDebug
```

### Release assinado

O workflow `.github/workflows/mobile-release.yml` gera um **AAB assinado** usando `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` e `ANDROID_KEY_PASSWORD` armazenados no Environment `production`.

Para publicação real, use Android App Bundle e Play App Signing. A partir de 31 de agosto de 2026, novos apps e atualizações enviados ao Google Play precisam direcionar para Android 16 / API 36 ou superior. urlRequisito de API do Google Playhttps://developer.android.com/google/play/requirements/target-sdk

## iOS

### Preparar

```bash
npm install
npx cap add ios
npm run mobile:configure
npm run mobile:assets
npx cap sync ios
```

### Abrir no Xcode

```bash
npm run cap:ios
```

### Release assinado

O workflow `.github/workflows/mobile-release.yml` cria um keychain temporário, importa o certificado Apple de distribuição, instala o provisioning profile, gera um **Xcode Archive** e exporta um **IPA**.

Secrets usados:

```text
APPLE_TEAM_ID
APPLE_CERTIFICATE_P12_BASE64
APPLE_CERTIFICATE_PASSWORD
APPLE_PROVISIONING_PROFILE_BASE64
APPLE_PROVISIONING_PROFILE_NAME
APPLE_KEYCHAIN_PASSWORD
```

O build e a publicação final para App Store exigem macOS/Xcode e uma conta Apple Developer. urlEnviar apps para a App Storehttps://developer.apple.com/app-store/submitting/

## GitHub Actions — release real

Workflow:

```text
.github/workflows/mobile-release.yml
```

Executa por:

```text
push de tag v1.2.0
```

ou manualmente em **Actions → FlashMarket Store Release → Run workflow**.

Artifacts esperados:

```text
flashmarket-android-v1.2.0
flashmarket-ios-archive-v1.2.0
flashmarket-ios-ipa-v1.2.0
```

Guia completo de configuração dos Secrets:

```text
RELEASE-PIPELINE.md
```

## Secrets de produção

Crie um Environment chamado:

```text
production
```

E adicione:

### Android

```text
ANDROID_KEYSTORE_BASE64
ANDROID_KEYSTORE_PASSWORD
ANDROID_KEY_ALIAS
ANDROID_KEY_PASSWORD
```

### Apple

```text
APPLE_TEAM_ID
APPLE_CERTIFICATE_P12_BASE64
APPLE_CERTIFICATE_PASSWORD
APPLE_PROVISIONING_PROFILE_BASE64
APPLE_PROVISIONING_PROFILE_NAME
APPLE_KEYCHAIN_PASSWORD
```

GitHub recomenda armazenar credenciais sensíveis em Actions Secrets/Environment Secrets e limitar o acesso às credenciais ao mínimo necessário. urlGitHub Secretshttps://docs.github.com/en/actions/concepts/security/secrets

## Google Play

Antes do primeiro envio:

- [ ] Conta Google Play Console
- [ ] App `FlashMarket`
- [ ] Package `br.flashmarket.app`
- [ ] Play App Signing
- [ ] Upload keystore criada
- [ ] Secrets Android configurados
- [ ] Política de privacidade
- [ ] Data Safety
- [ ] Classificação e conteúdo do app
- [ ] Screenshots
- [ ] Teste interno/fechado
- [ ] AAB assinado gerado

## App Store

Antes do envio:

- [ ] Apple Developer Program
- [ ] Bundle ID `br.flashmarket.app`
- [ ] App Store Connect
- [ ] Certificado Apple Distribution
- [ ] Provisioning Profile App Store
- [ ] Secrets Apple configurados
- [ ] TestFlight
- [ ] Privacidade
- [ ] Classificação etária
- [ ] Screenshots
- [ ] Descrição e palavras-chave
- [ ] IPA gerado

## Permissões

### Android

- Internet: necessária para catálogo, autenticação e API.
- Notificações: preparada para futuras notificações.

Não adicionar câmera, localização, microfone, contatos ou armazenamento amplo sem uma funcionalidade real que dependa deles.

### iOS

Não adicionar mensagens de uso de câmera/localização/microfone enquanto essas APIs não forem utilizadas.

## Segurança

Nunca colocar no repositório:

```text
*.jks
*.keystore
*.p12
*.mobileprovision
keystore.properties
ExportOptions.plist
senhas
chaves privadas
```

O `.gitignore` já cobre os principais arquivos de assinatura e artefatos de build.

O workflow cria os arquivos secretos apenas no runner temporário e os remove no final.

## Publicação

A automação agora está preparada para **gerar os artefatos assinados**, mas o envio final para Google Play/App Store continua dependente das contas e aprovação das lojas.

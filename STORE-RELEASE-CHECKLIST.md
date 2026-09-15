# FlashMarket — checklist Google Play + App Store

## Identidade do aplicativo

- Nome: **FlashMarket**
- App ID / Android package / iOS Bundle ID: `br.flashmarket.app`
- Versão atual: `1.2.0`
- Android versionCode: `12000`
- iOS build: `12000`
- Cor principal: `#FFC21C`
- Fundo nativo: `#111111`
- Categoria sugerida: Shopping

## Estrutura nativa

O projeto usa Capacitor para transformar o frontend existente em aplicativos Android e iOS, mantendo o mesmo código web como camada de interface. O Capacitor suporta adicionar Android/iOS a uma aplicação web existente. urlDocumentação Capacitorhttps://capacitorjs.com/docs

A estrutura nativa é criada com:

```bash
npm install
npx cap add android
npx cap add ios
```

Os recursos de ícone e splash são gerados a partir de `assets/logo.svg` e `assets/logo-dark.svg` com `@capacitor/assets`. A ferramenta gera os recursos nativos de Android, iOS e PWA. urlCapacitor Assetshttps://github.com/ionic-team/capacitor-assets

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

O gerador deve ser executado depois que `android/` e `ios/` existirem. A documentação atual recomenda fontes de ícone de pelo menos 1024×1024 e fontes de splash de pelo menos 2732×2732 quando usando o modo de controle completo; no modo simples, SVG também pode ser usado como fonte. Android 12+ usa o novo modelo de splash screen do sistema. urlGuia de ícones e splash do Capacitorhttps://capacitorjs.com/docs/guides/splash-screens-and-icons

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

### Gerar APK de teste

```bash
cd android
./gradlew assembleDebug
```

No Windows PowerShell:

```powershell
cd android
.\gradlew.bat assembleDebug
```

### Google Play

Para publicação, use **Android App Bundle (.aab)** e configure assinatura de release/Play App Signing. A partir de **31 de agosto de 2026**, novos apps e atualizações enviados ao Google Play precisam direcionar para **Android 16 / API 36 ou superior**. urlRequisito de API do Google Playhttps://developer.android.com/google/play/requirements/target-sdk

Antes do primeiro envio:

- Criar conta no Google Play Console.
- Criar o aplicativo com o mesmo package `br.flashmarket.app`.
- Configurar Play App Signing.
- Gerar uma chave de upload e guardá-la fora do repositório.
- Gerar `.aab` de release.
- Preencher nome, descrição curta, descrição completa, categoria e contato.
- Adicionar ícone e imagens de divulgação.
- Informar política de privacidade.
- Preencher Data safety e conteúdo do app.
- Testar em aparelhos Android reais.

**Nunca** coloque keystore, senha de keystore ou chave privada no GitHub.

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

O build e a publicação final para App Store exigem macOS + Xcode e uma conta Apple Developer. A Apple exige metadados, classificação etária, informações de privacidade e um build selecionado antes do envio para revisão. urlEnviar apps para a App Storehttps://developer.apple.com/app-store/submitting/

Antes do envio:

- Criar Apple Developer Program.
- Registrar Bundle ID `br.flashmarket.app`.
- Criar o app no App Store Connect.
- Configurar Signing & Capabilities.
- Selecionar Team correto no Xcode.
- Configurar versão `1.2.0`.
- Arquivar com Archive.
- Enviar para App Store Connect.
- Testar via TestFlight.
- Preencher descrição, palavras-chave, categoria e classificação etária.
- Preencher informações de privacidade.
- Adicionar screenshots de iPhone/iPad quando aplicável.

A Apple permite de 1 a 10 screenshots por tamanho/localização aplicável. urlEspecificações de screenshots da App Storehttps://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications

## Permissões

O FlashMarket é configurado inicialmente com permissões mínimas:

### Android

- Internet: necessária para catálogo, autenticação e API.
- Notificações: preparada para futuras notificações de pedidos/promos; o pedido de autorização em runtime deve ser feito somente quando o recurso for realmente usado.

Não adicionar câmera, localização, microfone, contatos ou armazenamento amplo sem uma funcionalidade que realmente dependa deles.

### iOS

Não adicionar mensagens de uso de câmera/localização/microfone enquanto essas APIs não forem utilizadas.

## Publicação real

Esta estrutura deixa o projeto **preparado para build e submissão**, mas não publica automaticamente nas lojas sem as contas de desenvolvedor, certificados/chaves e dados de loja do proprietário.

A publicação automática pode ser adicionada depois usando GitHub Actions + secrets. Segredos de assinatura devem ficar exclusivamente em GitHub Secrets ou no ambiente local seguro.

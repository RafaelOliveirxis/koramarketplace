# 🚀 FlashMarket — Release de produção Android + iOS

Este documento descreve o fluxo de release real do FlashMarket sem colocar chaves privadas no repositório.

## 1. O que foi automatizado

O workflow `.github/workflows/mobile-release.yml`:

- gera o projeto Android com Capacitor;
- gera o projeto iOS com Capacitor;
- configura nome, package/bundle ID e versão;
- gera ícones e splash com `@capacitor/assets`;
- assina o Android usando uma keystore fornecida por GitHub Secret;
- gera um **Android App Bundle (.aab)**;
- cria um keychain temporário no macOS;
- importa o certificado Apple de distribuição a partir de Secret;
- instala o provisioning profile a partir de Secret;
- cria um **Xcode Archive (.xcarchive)**;
- exporta um **IPA** para App Store;
- publica AAB, Archive e IPA como artifacts do workflow;
- remove o material de assinatura do runner ao final.

O workflow roda quando uma tag `v*.*.*` é enviada ou manualmente pelo GitHub Actions.

## 2. Ambiente de produção

Crie um ambiente chamado:

```text
production
```

Em:

`GitHub → Settings → Environments → New environment`

Recomenda-se colocar todos os segredos de release nesse ambiente.

## 3. Segredos Android

Crie estes **Environment secrets** em `production`:

```text
ANDROID_KEYSTORE_BASE64
ANDROID_KEYSTORE_PASSWORD
ANDROID_KEY_ALIAS
ANDROID_KEY_PASSWORD
```

### 3.1 Criar a keystore

Faça isso no seu computador, nunca no GitHub:

```powershell
keytool -genkeypair `
  -v `
  -keystore flashmarket-upload.jks `
  -alias flashmarket-upload `
  -keyalg RSA `
  -keysize 2048 `
  -validity 10000
```

Guarde:

- `flashmarket-upload.jks`;
- senha da keystore;
- alias;
- senha da chave.

Faça backup seguro. A chave de upload é importante para futuras atualizações do aplicativo.

### 3.2 Converter a keystore para Base64

PowerShell:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes(".\flashmarket-upload.jks")) | Set-Clipboard
```

Cole o conteúdo copiado no Secret:

```text
ANDROID_KEYSTORE_BASE64
```

Não envie a keystore para o GitHub como arquivo normal.

## 4. Segredos Apple

Crie estes **Environment secrets**:

```text
APPLE_TEAM_ID
APPLE_CERTIFICATE_P12_BASE64
APPLE_CERTIFICATE_PASSWORD
APPLE_PROVISIONING_PROFILE_BASE64
APPLE_PROVISIONING_PROFILE_NAME
APPLE_KEYCHAIN_PASSWORD
```

### 4.1 Certificado Apple

No Mac, exporte o certificado de distribuição pelo Keychain Access como `.p12`.

Depois:

```bash
base64 -i distribution.p12 | pbcopy
```

Cole no:

```text
APPLE_CERTIFICATE_P12_BASE64
```

A senha usada ao exportar o `.p12` fica em:

```text
APPLE_CERTIFICATE_PASSWORD
```

### 4.2 Provisioning Profile

Crie no Apple Developer um provisioning profile de distribuição para o Bundle ID:

```text
br.flashmarket.app
```

Depois converta o arquivo `.mobileprovision`:

```bash
base64 -i FlashMarket_AppStore.mobileprovision | pbcopy
```

Cole no:

```text
APPLE_PROVISIONING_PROFILE_BASE64
```

O nome exato do profile fica em:

```text
APPLE_PROVISIONING_PROFILE_NAME
```

Exemplo:

```text
FlashMarket AppStore Distribution
```

Não confunda o nome do profile com o Bundle ID.

### 4.3 Team ID

Use o Team ID da conta Apple Developer, por exemplo:

```text
XXXXXXXXXX
```

Coloque em:

```text
APPLE_TEAM_ID
```

### 4.4 Senha do keychain temporário

Pode ser uma senha criada exclusivamente para o CI:

```text
APPLE_KEYCHAIN_PASSWORD
```

Ela não precisa ser a senha do seu Mac.

## 5. Criar os Secrets no GitHub

Abra:

`GitHub → Settings → Environments → production → Environment secrets`

Depois clique em **Add secret** para cada nome.

Nunca coloque valores secretos em:

- `README.md`;
- `package.json`;
- `.env` commitado;
- `capacitor.config.ts`;
- `build.gradle` commitado;
- workflow diretamente;
- Issues;
- Pull Requests;
- screenshots.

GitHub Actions disponibiliza secrets apenas quando o workflow os referencia explicitamente. urlGitHub Secretshttps://docs.github.com/en/actions/concepts/security/secrets

## 6. Gerar uma release

Depois de configurar os secrets:

```bash
git add .
git commit -m "release: FlashMarket 1.2.0"
git push origin main
```

Crie a tag:

```bash
git tag v1.2.0
git push origin v1.2.0
```

Isso inicia:

```text
🚀 FlashMarket Store Release
        │
        ├── Android
        │     ├── Capacitor
        │     ├── Assets
        │     ├── Keystore
        │     ├── Gradle Release
        │     └── app-release.aab
        │
        └── iOS
              ├── Capacitor
              ├── Assets
              ├── Certificate
              ├── Provisioning Profile
              ├── Xcode Archive
              └── FlashMarket.ipa
```

## 7. Artifacts gerados

No GitHub Actions → workflow → run, estarão disponíveis:

```text
flashmarket-android-v1.2.0
flashmarket-ios-archive-v1.2.0
flashmarket-ios-ipa-v1.2.0
```

O AAB é o arquivo que será enviado ao Google Play Console.

O IPA é o arquivo de distribuição para o fluxo App Store/TestFlight.

## 8. Google Play

Depois de baixar o `.aab`:

1. Abra o Google Play Console.
2. Crie/abra o app `FlashMarket`.
3. Package name:

```text
br.flashmarket.app
```

4. Configure Play App Signing.
5. Faça upload do `.aab` na faixa de teste.
6. Teste internamente/fechado.
7. Preencha Data Safety, classificação, política de privacidade e conteúdo do app.
8. Envie para produção quando estiver tudo aprovado.

O Google Play exige atualmente target API 36 para novos apps e atualizações a partir de 31 de agosto de 2026. urlRequisitos de target API do Google Playhttps://developer.android.com/google/play/requirements/target-sdk

## 9. App Store

Depois de gerar o Archive/IPA:

1. Abra o App Store Connect.
2. Crie o app com Bundle ID:

```text
br.flashmarket.app
```

3. Envie o build para TestFlight.
4. Teste em dispositivos reais.
5. Configure descrição, categoria, classificação etária e privacidade.
6. Adicione screenshots.
7. Selecione o build.
8. Envie para App Review.

## 10. Segurança

O workflow nunca grava a keystore, `.p12` ou provisioning profile no Git.

Os arquivos são reconstruídos somente durante o job:

```text
GitHub Secret
     ↓
Runner temporário
     ↓
Build assinado
     ↓
Artifact
     ↓
Limpeza
```

O repositório mantém apenas configuração e código.

## 11. O que continua manual

A automação gera os binários assinados, mas não deve inventar ou armazenar credenciais das lojas.

Ainda dependem das contas do proprietário:

- Google Play Console;
- Apple Developer Program;
- App Store Connect;
- Play App Signing;
- certificado Apple;
- provisioning profile;
- dados de privacidade;
- screenshots;
- textos da loja;
- aprovação das lojas.

## 12. Checklist final

### Android

- [ ] `ANDROID_KEYSTORE_BASE64`
- [ ] `ANDROID_KEYSTORE_PASSWORD`
- [ ] `ANDROID_KEY_ALIAS`
- [ ] `ANDROID_KEY_PASSWORD`
- [ ] Google Play Console
- [ ] Play App Signing
- [ ] Política de privacidade
- [ ] Data Safety
- [ ] Screenshots

### iOS

- [ ] `APPLE_TEAM_ID`
- [ ] `APPLE_CERTIFICATE_P12_BASE64`
- [ ] `APPLE_CERTIFICATE_PASSWORD`
- [ ] `APPLE_PROVISIONING_PROFILE_BASE64`
- [ ] `APPLE_PROVISIONING_PROFILE_NAME`
- [ ] `APPLE_KEYCHAIN_PASSWORD`
- [ ] Apple Developer
- [ ] App Store Connect
- [ ] TestFlight
- [ ] Privacidade
- [ ] Screenshots

### Segurança

- [ ] Nenhuma `.jks` no Git
- [ ] Nenhum `.p12` no Git
- [ ] Nenhum `.mobileprovision` no Git
- [ ] Nenhuma senha no workflow
- [ ] Nenhuma chave privada no README
- [ ] Environment `production` protegido

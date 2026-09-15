# 📱 FlashMarket — Android e iOS

O repositório já está preparado para transformar o FlashMarket web em aplicativo Android e iOS usando **Capacitor 7**. A configuração atual usa o identificador `br.flashmarket.app` e o diretório `FlashMarket` como conteúdo web.

## 1. Preparar o projeto

No Windows:

```bash
npm install
npm run mobile:android
```

Para iOS, a preparação deve ser feita em um Mac com Xcode:

```bash
npm install
npm run mobile:ios
```

> Android pode ser desenvolvido no Windows. A compilação e publicação nativa de iOS exigem macOS/Xcode.

## 2. Android — Google Play

Depois de gerar a plataforma Android:

```bash
npx cap sync android
npx cap open android
```

No Android Studio, configure:

- nome do aplicativo: FlashMarket;
- applicationId: `br.flashmarket.app`;
- ícone e splash screen oficiais;
- versão e versionCode;
- assinatura de release;
- arquivo `.aab` para o Google Play Console.

Para uma distribuição de produção, o `.aab` precisa ser assinado com uma chave de release. **Nunca coloque a keystore ou senhas no GitHub.**

## 3. iOS — App Store

Em um Mac:

```bash
npx cap add ios
npx cap sync ios
npx cap open ios
```

No Xcode, configure:

- Bundle Identifier: `br.flashmarket.app`;
- Apple Developer Team;
- Signing & Capabilities;
- ícone e Launch Screen;
- versão e build number;
- modo Release;
- Archive e distribuição pelo App Store Connect.

A publicação exige uma conta Apple Developer e as configurações de assinatura/certificados da Apple.

## 4. Publicação automática

O GitHub Actions pode automatizar a preparação e a compilação. A publicação final nas lojas depende das credenciais das lojas e dos certificados de assinatura.

### Android

Para automatizar o envio ao Google Play, configure no GitHub Actions os secrets necessários para a conta de serviço do Google Play Console e a assinatura Android.

### iOS

Para automatizar o envio à App Store Connect, configure os certificados/perfis e credenciais da Apple de forma segura como GitHub Secrets.

## 5. Importante sobre a versão web

O GitHub Pages continua sendo a versão web. O aplicativo Android/iOS usa a mesma aplicação `FlashMarket` empacotada pelo Capacitor.

Antes de publicar nas lojas, valide principalmente:

- login/cadastro;
- API em HTTPS;
- checkout e pagamentos reais, se forem ativados;
- links externos;
- armazenamento local;
- permissões nativas;
- política de privacidade;
- termos de uso;
- ícones e screenshots das lojas;
- funcionamento em aparelhos reais.

## 6. Status

- ✅ Website responsivo
- ✅ GitHub Pages
- ✅ Configuração Capacitor 7
- ✅ Identificador do aplicativo `br.flashmarket.app`
- ✅ Scripts para preparar Android/iOS
- ⏳ Gerar e configurar projetos nativos Android/iOS
- ⏳ Assinatura de release
- ⏳ Google Play Console
- ⏳ Apple Developer / App Store Connect
- ⏳ Publicação nas lojas

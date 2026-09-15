import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = '1.2.0';
const VERSION_CODE = 12000;
const APP_ID = 'br.flashmarket.app';
const APP_NAME = 'FlashMarket';

function exists(file) {
  return fs.existsSync(path.join(ROOT, file));
}

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function write(file, content) {
  fs.writeFileSync(path.join(ROOT, file), content, 'utf8');
}

function replaceOnce(file, pattern, replacement) {
  const content = read(file);
  if (!pattern.test(content)) return false;
  write(file, content.replace(pattern, replacement));
  return true;
}

function ensureLine(file, line) {
  const content = read(file);
  if (content.includes(line)) return;
  write(file, content + `\n${line}\n`);
}

console.log(`⚡ Configurando ${APP_NAME} ${VERSION} (${APP_ID})...`);

if (exists('android/app/build.gradle')) {
  const androidGradle = 'android/app/build.gradle';
  let content = read(androidGradle);
  content = content.replace(/applicationId\s+"[^"]+"/, `applicationId "${APP_ID}"`);
  content = content.replace(/versionCode\s+\d+/, `versionCode ${VERSION_CODE}`);
  content = content.replace(/versionName\s+"[^"]+"/, `versionName "${VERSION}"`);
  write(androidGradle, content);
  console.log('✓ Android applicationId/versionCode/versionName configurados.');
}

if (exists('android/variables.gradle')) {
  const variables = 'android/variables.gradle';
  let content = read(variables);
  content = content.replace(/targetSdkVersion\s*=\s*\d+/, 'targetSdkVersion = 36');
  content = content.replace(/compileSdkVersion\s*=\s*\d+/, 'compileSdkVersion = 36');
  write(variables, content);
  console.log('✓ Android compile/target SDK ajustados para API 36.');
}

if (exists('android/app/src/main/AndroidManifest.xml')) {
  const manifest = 'android/app/src/main/AndroidManifest.xml';
  let content = read(manifest);
  if (!content.includes('android.permission.POST_NOTIFICATIONS')) {
    content = content.replace(
      '<manifest ',
      '<manifest ',
    );
    const marker = '<uses-permission android:name="android.permission.INTERNET" />';
    if (content.includes(marker)) {
      content = content.replace(marker, `${marker}\n    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />`);
    } else {
      content = content.replace('<application', '    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />\n\n    <application');
    }
  }
  write(manifest, content);
  console.log('✓ Permissões Android configuradas: Internet + notificações.');
}

if (exists('ios/App/App/Info.plist')) {
  const plist = 'ios/App/App/Info.plist';
  let content = read(plist);
  const entries = [
    ['CFBundleDisplayName', APP_NAME],
    ['CFBundleShortVersionString', VERSION],
    ['CFBundleVersion', String(VERSION_CODE)],
  ];
  for (const [key, value] of entries) {
    const pattern = new RegExp(`<key>${key}<\\/key>\\s*<string>[^<]*<\\/string>`);
    const replacement = `<key>${key}</key>\n\t<string>${value}</string>`;
    if (pattern.test(content)) content = content.replace(pattern, replacement);
    else content = content.replace('</dict>', `\t<key>${key}</key>\n\t<string>${value}</string>\n</dict>`);
  }
  write(plist, content);
  console.log('✓ iOS nome/versão/build configurados.');
}

if (exists('ios/App/App.xcodeproj/project.pbxproj')) {
  const pbx = 'ios/App/App.xcodeproj/project.pbxproj';
  let content = read(pbx);
  content = content.replace(/PRODUCT_BUNDLE_IDENTIFIER = [^;]+;/g, `PRODUCT_BUNDLE_IDENTIFIER = ${APP_ID};`);
  content = content.replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${VERSION};`);
  content = content.replace(/CURRENT_PROJECT_VERSION = [^;]+;/g, `CURRENT_PROJECT_VERSION = ${VERSION_CODE};`);
  write(pbx, content);
  console.log('✓ iOS bundle identifier/version/build number configurados.');
}

if (exists('android/app/src/main/res/values/strings.xml')) {
  const strings = 'android/app/src/main/res/values/strings.xml';
  let content = read(strings);
  content = content.replace(/<string name="app_name">[^<]*<\/string>/, `<string name="app_name">${APP_NAME}</string>`);
  write(strings, content);
}

console.log('✓ Configuração mobile concluída.');
console.log('ℹ️ Não são adicionadas permissões de câmera/localização/contatos porque o FlashMarket atual não precisa delas.');

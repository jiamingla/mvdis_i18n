const fs = require("fs").promises;
const path = require("path");
const process = require("process");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const TOKEN_PATH = path.join(process.cwd(), "token.json"); // 存放 refresh token
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json"); // 下載的憑證檔案

// 檢查是否有 refresh token
async function loadSavedCredentialsIfExist() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
}

async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: "authorized_user",
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
}

// 如果首次執行先取得 refresh token, 非首次則直接根據 refresh token 產生 access token
async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
        return client;
    }
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
}

const spreadsheetId = "1y5DI4us6IWy9CHxIOvLlzu5-IZxQwHZKCYrxkQ3Tv4o";
const range = "工作表1!A:E";
const valueInputOption = "RAW"; // 儲存格資料格式
const values = [
    // 寫入儲存格的資料
    ["監理站名稱", "駕照代號", "分類ID", "數量", "敘述"],
];

let rawDataDir = path.join(process.cwd(), "./result");

// 原始檔所在資料夾
async function batch_process() {
    console.table(rawDataDir);

    try {
        const files = await fs.readdir(rawDataDir);
        for (const file of files) {
            let rawFilePath = path.join(rawDataDir, file);

            // 讀取原始檔
            let rawFile = await fs.readFile(rawFilePath, "utf-8"); //fs.readFileSync (檔案路徑，編碼格式)，返回內容
            // 把源資料轉為可以處理的格式
            let rawData = JSON.parse(rawFile);
            // 處理為最終資料邏輯
            for (let j = 0; j < rawData.length; j++) {
                const data = rawData[j];
                values.push([
                    data["dmvName"],
                    data["licenseTypeCode"],
                    data["category_id"],
                    data["count"],
                    data["description"],
                ]);
            }
        } // 拼接每個檔案完整路徑

        console.table(values);
    } catch (err) {
        console.error(err);
    }
}

async function saveSheet(auth) {
    const sheets = google.sheets({
        version: "v4",
        auth,
    });
    sheets.spreadsheets.values.update(
        {
            spreadsheetId: spreadsheetId,
            range: range,
            valueInputOption: valueInputOption,
            requestBody: {
                values: values,
            },
        },
        (err, res) => {
            if (err) return console.log(`The API returned an error: ${err}`);
            console.log(res.data);
        }
    );
}
async function main() {
    await batch_process();
    authorize().then(saveSheet).catch(console.error);
}
main();

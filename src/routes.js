import { createPuppeteerRouter, RequestQueue, log, KeyValueStore } from 'crawlee';
import fs from 'fs/promises';
export const router = createPuppeteerRouter();
import { delay, insertDataToDB, checkCookieValidity } from './utils.js'
import { insertBoundIndexData } from './insertBoundIndexData.js';
import dayjs from 'dayjs';
// 在函数开始时获取 RequestQueue
const requestQueue = await RequestQueue.open();

const ACCOUNT = {
    dongtian: {
        user_name: '13166911205',
        password: 'a123456b'
    },
    leichao: {
        user_name: '15001374711',
        password: '968716asD'
    }
}

const TIMEOUT = 60000;  // 超时时间
// 未登录展示的描述信息
const VISIT_TEXT = '游客仅显示前 30 条转债记录，请登录查看完整列表数据';
const COOKIES_KEY = 'cookies';  // 存储 cookies 的键
const LOCAL_STORAGE_KEY = 'localStorage';

const { user_name, password } = ACCOUNT.leichao;


const addBoundIndex = async (page) => {
    // 获取可转债等权数据
    // 获取 "转债等权指数"
    console.error("获取转债等权指数");
    const bondIndex = await page.$eval('.rolling-index .index-data a.bold-400', el => el.textContent.trim());

    // 获取价格中位数
    const medianPrice = await page.$eval('.rolling-index .avg-data div:nth-child(1)', el => el.textContent.trim());

    // 获取溢价率中位数
    const medianPremiumRate = await page.$eval('.rolling-index .avg-data div:nth-child(2)', el => el.textContent.trim());

    // 获取到期收益率
    const yieldToMaturity = await page.$eval('.rolling-index .avg-data div:nth-child(3)', el => el.textContent.trim());

    const boundInfo = {
        id: 1,
        bond_index: bondIndex,
        median_price: medianPrice,
        median_premium_rate: medianPremiumRate,
        yield_to_maturity: yieldToMaturity,
        created_at: dayjs().toDate()
    }
    await insertBoundIndexData([boundInfo]);
}


router.addDefaultHandler(async ({ page, browserController }) => {
    console.info(`enqueueing new URLs`);
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // 加载 cookies
    const store = await KeyValueStore.open();
    const savedCookies = await store.getValue(COOKIES_KEY);
    const savedLocalStorage = await store.getValue(LOCAL_STORAGE_KEY);

    const isValid = await checkCookieValidity(savedCookies);

    if (isValid) {
        console.info('Loading saved cookies...');
        await page.setCookie(...savedCookies);  // 设置 cookies

        // 恢复 LocalStorage
        if (savedLocalStorage) {
            console.info('Loading saved LocalStorage...');
            await page.evaluate(data => {
                const parsedData = JSON.parse(data);
                for (const key in parsedData) {
                    localStorage.setItem(key, parsedData[key]);
                }
            }, savedLocalStorage);
        }
    }


    // 监听新页面打开事件
    page.on('response', async (response) => {
        const url = response.url();
        // 检查是否是目标 API 请求
        if (url.includes('https://www.jisilu.cn/webapi/cb/list/')) {
            log.info(`Intercepted API response from: ${url}`);
            try {
                const jsonData = await response.json(); // 获取 API 响应 JSON 数据
                if (jsonData.data?.length > 50) {
                    // 获取到对应的数据入库
                    await insertDataToDB(jsonData.data)
                    const store = await KeyValueStore.open();
                    await store.setValue('api-response', jsonData);

                    // 写入数据
                    // const filePath = './api-response.json';
                    // console.error('写入成功', jsonData?.data?.length)

                    // 检查文件是否存在
                    // try {
                    //     await fs.access(filePath); // 检查文件是否存在
                    //     console.error('文件存在, 删除')

                    //     // 如果存在，则删除文件
                    //     await fs.unlink(filePath);
                    // } catch (error) {
                    //     if (error.code === 'ENOENT') {
                    //         console.info(`File ${filePath} does not exist. Skipping deletion.`);
                    //     } else {
                    //         console.error(`Error while checking file existence:`, error);
                    //         throw error; // 如果是其他错误，则抛出
                    //     }
                    // }
                    // await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2));

                    // log.info(`Saved API response to file: ${filePath}`);

                    // 处理数据
                    const length = jsonData.data.length;
                    // TODO: 修改数量

                    // for (let i = 0; i < 1; i++) {
                    //     const firstBond = jsonData.data[i]
                    //     // 详情地址数据
                    //     const detailLink = `https://www.jisilu.cn/data/convert_bond_detail/${firstBond.bond_id}?index=${i}`;
                    //     await requestQueue.addRequest({
                    //         url: detailLink,
                    //         label: 'DETAIL',
                    //     });
                    // }
                }

            } catch (error) {
                log.error('Failed to parse API response:', error);
            }
        }
    });

    const handleNoLogin = async () => {
        try {
            console.error('当前未登录');
            // 等待 class 为 "not_login" 的元素出现
            await page.waitForSelector('.not_login', { timeout: TIMEOUT });
            // 查找 class 为 "not_login" 下的 class 为 "el-button-group" 的子元素
            const button = await page.$('.not_login .el-button-group button:first-child');

            if (button) {
                // 获取按钮文本
                const text = await page.evaluate((btn) => btn.textContent?.trim(), button);
                console.info(`Found button with text: "${text}"`);

                // 检查文本是否为 "登录"
                if (text === '登录') {
                    console.info('Clicking the "登录" button...');
                    await button.click();
                    await page.waitForNavigation({ waitUntil: 'networkidle0' }); // 等待页面跳转完成
                    // 等待 1s
                    await delay(1000);

                    // 找到输入框
                    const inputSelector = 'input.form-control[name="user_name"]';
                    await page.waitForSelector(inputSelector, { timeout: TIMEOUT }); // 10秒超时

                    // 输入文本
                    await page.type(inputSelector, user_name);

                    const passwordSelector = 'input.form-control[name="password"]';
                    await page.waitForSelector(passwordSelector, { timeout: TIMEOUT }); // 10秒超时

                    // 输入文本
                    await page.type(passwordSelector, password);
                    const checkSelector = ".user_agree_box .remember_me input[name='auto_login']"
                    await page.waitForSelector(checkSelector, { timeout: TIMEOUT }); // 10秒超时
                    await page.click(checkSelector);

                    const agreeSelector = ".user_agree_box .user_agree input"
                    await page.waitForSelector(agreeSelector, { timeout: TIMEOUT }); // 10秒超时
                    await page.click(agreeSelector);
                    await page.click('.password_login form .text_align_center');

                    await page.waitForSelector('.user_icon .name', { timeout: TIMEOUT });
                    // 登录逻辑...
                    const cookies = await page.cookies();
                    const localStorageData = await page.evaluate(() => JSON.stringify(localStorage));

                    // 保存 cookies 和 LocalStorage
                    await store.setValue(COOKIES_KEY, cookies);
                    await store.setValue(LOCAL_STORAGE_KEY, localStorageData);
                    console.info('Login successful. Cookies and LocalStorage saved.');
                    cookies.forEach(cookie => {
                        console.log(`Cookie 有效期: ${cookie.name}, Expires: ${cookie.expires}`);
                    });


                    const userName = await page.$eval('.user_icon .name', (el) => el.textContent?.trim());
                    console.info(`Element content: ${text}`);
                    console.info(`userName: "${userName}"`);
                    await page.waitForSelector('.jsl-table-body-wrapper .jsl-table-body td .jsl-table-body-wrapper ', { timeout: TIMEOUT * 100 });
                    console.error('等待表格加载完成')
                    // 此处需要等待表格数据加载完成
                    const firstTableRowCount = await page.$eval('.jsl-table-body:nth-of-type(1)', (table) => {
                        return table.querySelectorAll('tr').length;
                    });
                    console.error('第一个表格的长度', firstTableRowCount)
                    await addBoundIndex(page)


                } else {
                    console.warn('The first button is not the "登录" button.');
                }
            } else {
                console.info('No button found under ".not_login .el-button-group".');
            }
        } catch (error) {
            console.info('出错了', error)
            console.info(JSON.stringify(error));
        }
    }

    // 检查登录状态
    try {
        await page.waitForNavigation({ waitUntil: 'networkidle0' }); // 等待页面跳转完成
        // 等待 class 为 "prompt" 的元素出现
        await page.waitForSelector('.prompt', { timeout: 10000 }); // 10秒超时

        // 现在可以对该元素进行操作，例如获取内容
        const text = await page.$eval('.prompt', (el) => el.textContent?.trim());
        console.info(`出现: ${text}`);

        if (text === VISIT_TEXT) {
            await handleNoLogin();
        } else {
            console.log("未登录文案未匹配")
        }
    } catch (error) {
        console.log(`未出现: ${VISIT_TEXT}`)
        // 标识已登录
        // 如果一直未出现，就去检测下当前获取的数量
        const selector = 'span.stat-count'; // 选择器
        await page.waitForSelector(selector, { timeout: 50000 });
        const resultText = await page.$eval(selector, el => el.textContent.trim());

        // 提取 "/" 后面的数字
        const match = resultText.match(/\/\s*(\d+)/);

        let numberAfterSlash;
        if (match) {
            numberAfterSlash = match[1]; // 捕获的数字
            console.log('Number after "/":', numberAfterSlash);
        } else {
            console.error('Failed to extract number after "/"');
        }
        console.log("numberAfterSlash", numberAfterSlash)
        if (parseInt(numberAfterSlash) > 30) {
            console.error('已登录')
            // 如果已经登录则不需要再执行登录操作
            await addBoundIndex(page);

        } else {
            throw (new Error("未登录"))
            await handleNoLogin();
        }
    }

});


router.addHandler('DETAIL', async ({ page, request, log }) => {
    log.info(`Processing details for: ${request.url}`);

    const store = await KeyValueStore.open();

    // 启用请求拦截
    await page.setRequestInterception(true);

    // 使用一个 Map 来存储 requestId 和响应数据的对应关系
    const interceptedResponses = new Map();

    page.on('request', (interceptedRequest) => {
        const url = interceptedRequest.url();

        if (url.includes('https://www.jisilu.cn/data/cbnew/dish/')) {
            log.info(`Intercepting request for URL: ${url}`);
            interceptedRequest.continue(); // 允许请求继续
        } else {
            interceptedRequest.continue(); // 对非目标请求继续放行
        }
    });

    page.on('response', async (response) => {
        const url = response.url();

        if (url.includes('https://www.jisilu.cn/data/cbnew/dish/')) {
            log.info(`Intercepted response for URL: ${url}`);
            try {
                const jsonData = await response.json();
                const parsedUrl = new URL(url);
                const requestUrl = new URL(request.url);
                const bondId = parsedUrl.searchParams.get('bond_id'); // 提取 bond_id
                const index = requestUrl.searchParams.get('index'); // 提取 bond_id

                if (bondId) {
                    interceptedResponses.set(bondId, jsonData); // 缓存响应数据
                    const key = `${Number(index) + 1}_${bondId}`;
                    await store.setValue(key, jsonData); // 保存数据
                    log.info(`Saved API response for bond_id=${bondId} as ${key}`);
                }
            } catch (error) {
                log.error(`Error parsing response for ${url}:`, error);
            }
        }
    });

    // 确保页面加载完成
    await page.goto(request.url, { waitUntil: 'networkidle2' });

    // 检查是否捕获到所需数据
    log.info(`Intercepted responses count: ${interceptedResponses.size}`);
    if (interceptedResponses.size === 0) {
        log.info(`没有响应被拦截url: ${request.url}`);
    }

    // 等待一段时间，确保所有接口调用完成
    await delay(5000)
});

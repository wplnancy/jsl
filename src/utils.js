
import mysql from 'mysql2/promise';

export const delay = async (time = 1000) => {
  await new Promise((resolve) => setTimeout(resolve, time)); // 等待 20 秒
}


export const insertDataToDB = async (data) => {
  const fields = [
    "bond_id", "bond_nm", "bond_py", "price", "increase_rt", "stock_id", "stock_nm", "stock_py", "sprice",
    "sincrease_rt", "pb", "int_debt_rate", "convert_price", "convert_value", "convert_dt", "premium_rt", "dblow",
    "sw_cd", "market_cd", "btype", "list_dt", "t_flag", "owned", "hold", "bond_value", "rating_cd", "option_value",
    "volatility_rate", "put_convert_price", "force_redeem_price", "convert_amt_ratio", "fund_rt", "maturity_dt",
    "year_left", "curr_iss_amt", "volume", "svolume", "turnover_rt", "ytm_rt", "put_ytm_rt", "notes", "noted",
    "last_time", "qstatus", "sqflag", "pb_flag", "adj_cnt", "adj_scnt", "convert_price_valid", "convert_price_tips",
    "convert_cd_tip", "ref_yield_info", "adjusted", "orig_iss_amt", "price_tips", "redeem_dt", "real_force_redeem_price",
    "option_tip", "after_next_put_dt", "icons", "is_min_price", "blocked", "debt_rate", "putting"
  ];

  // 数据类型处理函数
  const sanitizeItem = item => {
    return fields.map(field => {
      let value = item[field] ?? null;

      // 特殊字段序列化
      if (field === "t_flag" || field === "icons") {
        value = JSON.stringify(value);
      }

      // 类型转换示例
      if (field === "price" || field === "increase_rt") {
        value = parseFloat(value) || null;
      }

      return value;
    });
  };

  (async () => {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '12345678',
      database: 'kzz_datax'
    });

    try {
      console.log('Database connection established.');

      // 动态生成更新子句
      const updateFields = fields
        .filter(field => field !== "bond_id") // 排除主键或唯一索引字段
        .map(field => `${field} = VALUES(${field})`) // ON DUPLICATE KEY UPDATE 子句
        .join(", ");

      const query = `
          INSERT INTO summary (
              ${fields.join(", ")}
          ) VALUES (
              ${fields.map(() => "?").join(", ")}
          )
          ON DUPLICATE KEY UPDATE
          ${updateFields}
      `;

      for (const item of data) {
        const values = sanitizeItem(item);
        await connection.execute(query, values);
      }

      console.log('Data inserted or updated successfully.');
    } catch (error) {
      console.error('Error inserting or updating data:', error);
    } finally {
      await connection.end();
      console.log('Database connection closed.');
    }
  })();
}



export const checkCookieValidity = async (cookies) => {
  try {
    if (!cookies) return false;
      // 找到指定的 cookie
      const loginCookie = cookies.find(cookie => cookie.name === 'kbzw__user_login');
      if (!loginCookie) {
          console.warn('Cookie kbzw__user_login 不存在，可能需要重新登录');
          return false; // 表示需要重新登录
      }

      const currentTime = Date.now() / 1000; // 当前时间戳（秒）
      console.info(`Cookie "kbzw__user_login" expires at: ${loginCookie.expires}, current time: ${currentTime}`);

      if (loginCookie.expires > currentTime) {
          console.info('Cookie 未过期，无需重新登录');
          return true; // Cookie 有效
      } else {
          console.warn('Cookie 已过期，需要重新登录');
          return false; // Cookie 过期，需要重新登录
      }
  } catch (error) {
      console.error('检查 Cookie 有效性时发生错误:', error);
      return false; // 出现错误，默认需要重新登录
  }
};
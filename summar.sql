CREATE TABLE bonds_data (
    bond_id VARCHAR(10) PRIMARY KEY,
    bond_nm VARCHAR(50),
    bond_py VARCHAR(20),
    price DECIMAL(10,3),
    increase_rt DECIMAL(10,2),
    last_5d_rt DECIMAL(10,2),
    last_20d_rt DECIMAL(10,2),
    last_3m_rt DECIMAL(10,2),
    last_1y_rt DECIMAL(10,2),
    stock_id VARCHAR(10),
    stock_nm VARCHAR(50),
    stock_py VARCHAR(20),
    sprice DECIMAL(10,3),
    sincrease_rt DECIMAL(10,2),
    pb DECIMAL(10,2),
    pe DECIMAL(10,2),
    roe DECIMAL(10,2),
    dividend_rate DECIMAL(10,3),
    pe_temperature DECIMAL(10,2),
    pb_temperature DECIMAL(10,2),
    int_debt_rate DECIMAL(10,2),
    pledge_rt DECIMAL(10,2),
    market_value DECIMAL(10,2),
    revenue DECIMAL(10,2),
    revenue_growth DECIMAL(10,2),
    profit DECIMAL(10,2),
    profit_growth DECIMAL(10,2),
    convert_price DECIMAL(10,2),
    convert_value DECIMAL(10,2),
    convert_dt INT,
    premium_rt DECIMAL(10,2),
    bond_premium_rt DECIMAL(10,2),
    dblow DECIMAL(10,2),
    adjust_condition VARCHAR(20),
    sw_nm_r VARCHAR(50),
    sw_cd VARCHAR(10),
    market_cd VARCHAR(10),
    btype VARCHAR(5),
    list_dt DATE,
    t_flag TEXT,
    owned INT,
    hold INT,
    bond_value DECIMAL(10,2),
    rating_cd VARCHAR(10),
    option_value DECIMAL(10,2),
    volatility_rate DECIMAL(10,2),
    put_convert_price DECIMAL(10,2),
    force_redeem_price DECIMAL(10,2),
    convert_amt_ratio DECIMAL(10,2),
    convert_amt_ratio2 DECIMAL(10,2),
    fund_rt DECIMAL(10,2),
    maturity_dt DATE,
    year_left DECIMAL(10,3),
    curr_iss_amt DECIMAL(10,3),
    volume DECIMAL(10,2),
    svolume DECIMAL(10,2),
    turnover_rt DECIMAL(10,2),
    ytm_rt DECIMAL(10,2),
    ytm_rt_tax DECIMAL(10,2),
    put_ytm_rt DECIMAL(10,2),
    notes TEXT,
    pct_rpt DECIMAL(10,2),
    total_market_value DECIMAL(10,2),
    redeem_price_total DECIMAL(10,3),
    redeem_status VARCHAR(20),
    province VARCHAR(50),
    sturnover_rt DECIMAL(10,2),
    slast_5d_rt DECIMAL(10,2),
    slast_20d_rt DECIMAL(10,2),
    slast_3m_rt DECIMAL(10,2),
    slast_1y_rt DECIMAL(10,2),
    bond_stdevry DECIMAL(10,2),
    bond_md DECIMAL(10,3),
    bond_bias20 DECIMAL(10,2),
    stock_bias20 DECIMAL(10,2),
    float_iss_amt DECIMAL(10,3),
    float_iss_value DECIMAL(10,3),
    total_cash_value DECIMAL(10,3),
    last_6m_rt DECIMAL(10,2),
    slast_6m_rt DECIMAL(10,2),
    this_y_rt DECIMAL(10,2),
    sthis_y_rt DECIMAL(10,2),
    noted INT,
    last_time TIME,
    qstatus VARCHAR(5),
    sqflag VARCHAR(5),
    pb_flag VARCHAR(5),
    adj_cnt INT,
    adj_scnt VARCHAR(5),
    convert_price_valid VARCHAR(5),
    convert_price_tips TEXT,
    convert_cd_tip TEXT,
    ref_yield_info TEXT,
    adjusted VARCHAR(5),
    orig_iss_amt DECIMAL(10,2),
    price_tips TEXT,
    redeem_dt DATE,
    real_force_redeem_price DECIMAL(10,2),
    option_tip TEXT,
    pct_chg DECIMAL(10,2),
    adjust_status VARCHAR(10),
    unadj_cnt INT,
    after_next_put_dt INT,
    redeem_remain_days INT,
    adjust_remain_days INT,
    adjust_orders INT,
    redeem_orders INT,
    icons TEXT,
    is_min_price INT,
    blocked INT,
    debt_rate DECIMAL(10,2),
    putting VARCHAR(5)
);

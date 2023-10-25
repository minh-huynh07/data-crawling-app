export function URL_MAPPING (category, currentPage) {
    const base_url = `https://www.quanlyluhanh.vn/index.php/search/${currentPage}?tendn=&sogiayphep=&diaphuong=&phamvihd=${category}&keyword=`;

    return base_url;
};
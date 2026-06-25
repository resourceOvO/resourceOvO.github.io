function clockUpdateTime(info, city) {
  let currentColor = "#000";
  switch (info.now.icon) {
    case "100":
      currentColor = "#fdcc45";
      break;
    case "101":
      currentColor = "#fe6976";
      break;
    case "102":
    case "103":
      currentColor = "#fe7f5b";
      break;
    case "104":
    case "150":
    case "151":
    case "152":
    case "153":
    case "154":
    case "800":
    case "801":
    case "802":
    case "803":
    case "804":
    case "805":
    case "806":
    case "807":
      currentColor = "#2152d1";
      break;
    case "300":
    case "301":
    case "305":
    case "306":
    case "307":
    case "308":
    case "309":
    case "310":
    case "311":
    case "312":
    case "313":
    case "314":
    case "315":
    case "316":
    case "317":
    case "318":
    case "350":
    case "351":
    case "399":
      currentColor = "#49b1f5";
      break;
    case "302":
    case "303":
    case "304":
      currentColor = "#fdcc46";
      break;
    case "400":
    case "401":
    case "402":
    case "403":
    case "404":
    case "405":
    case "406":
    case "407":
    case "408":
    case "409":
    case "410":
    case "456":
    case "457":
    case "499":
      currentColor = "#a3c2dc";
      break;
    case "500":
    case "501":
    case "502":
    case "503":
    case "504":
    case "507":
    case "508":
    case "509":
    case "510":
    case "511":
    case "512":
    case "513":
    case "514":
    case "515":
      currentColor = "#97acba";
      break;
    case "900":
    case "999":
      currentColor = "red";
      break;
    case "901":
      currentColor = "#179fff;";
      break;
    default:
      break;
  }
  var clock_box = document.getElementById("hexo_electric_clock");

  clock_box_html = `
  <div class="clock-row">
    <span id="card-clock-clockdate" class="card-clock-clockdate"></span>
    <span class="card-clock-weather"><i class="qi-${info.now.icon}-fill" style="color: ${currentColor}"></i> ${info.now.text} <span>${info.now.temp}</span> ℃</span>
    <span class="card-clock-humidity">💧 ${info.now.humidity}%</span>
  </div>
  <div class="clock-row">
    <span id="card-clock-time" class="card-clock-time"></span>
  </div>
  <div class="clock-row">
    <span class="card-clock-windDir"> <i class="qi-gale"></i> ${info.now.windDir}</span>
    <span class="card-clock-location">${city}</span>
    <span id="card-clock-dackorlight" class="card-clock-dackorlight"></span>
  </div>
  `;
  var week = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  var card_clock_loading_dom = document.getElementById("card-clock-loading");
  if (card_clock_loading_dom) {
    card_clock_loading_dom.innerHTML = "";
  }
  clock_box.innerHTML = clock_box_html;
  function updateTime() {
    var cd = new Date();
    var card_clock_time =
      zeroPadding(cd.getHours(), 2) + ":" + zeroPadding(cd.getMinutes(), 2) + ":" + zeroPadding(cd.getSeconds(), 2);
    var card_clock_date =
      zeroPadding(cd.getFullYear(), 4) +
      "-" +
      zeroPadding(cd.getMonth() + 1, 2) +
      "-" +
      zeroPadding(cd.getDate(), 2) +
      " " +
      week[cd.getDay()];
    var card_clock_dackorlight = cd.getHours();
    var card_clock_dackorlight_str;
    if (card_clock_dackorlight > 12) {
      card_clock_dackorlight -= 12;
      card_clock_dackorlight_str = " P M";
    } else {
      card_clock_dackorlight_str = " A M";
    }
    if (document.getElementById("card-clock-time")) {
      var card_clock_time_dom = document.getElementById("card-clock-time");
      var card_clock_date_dom = document.getElementById("card-clock-clockdate");
      var card_clock_dackorlight_dom = document.getElementById("card-clock-dackorlight");
      card_clock_time_dom.innerHTML = card_clock_time;
      card_clock_date_dom.innerHTML = card_clock_date;
      card_clock_dackorlight_dom.innerHTML = card_clock_dackorlight_str;
    }
  }
  function zeroPadding(num, digit) {
    var zero = "";
    for (var i = 0; i < digit; i++) {
      zero += "0";
    }
    return (zero + num).slice(-digit);
  }
  var timerID = setInterval(updateTime, 1000);
  updateTime();
}
function getIpInfo() {
  const defaultCity = "重庆市";
  const qweather_host = typeof qweather_api_host !== "undefined" ? qweather_api_host : "m378m3gmu3.re.qweatherapi.com";
  const amapKey = typeof gaud_map_key !== "undefined" ? gaud_map_key : "";

  function fetchWeather(location, city) {
    fetch(`https://${qweather_host}/v7/weather/now?location=${location}&key=${qweather_key}`)
      .then(res => res.json())
      .then(data => {
        if (data.code === "200" && document.getElementById("hexo_electric_clock")) {
          clockUpdateTime(data, city);
        }
      })
      .catch(err => console.error("天气数据获取失败:", err));
  }

  if (clock_default_rectangle_enable === "true") {
    fetchWeather(clock_rectangle, defaultCity);
  } else {
    // 使用高德地图IP定位API
    fetch(`https://restapi.amap.com/v3/ip?key=${amapKey}`)
      .then(res => res.json())
      .then(data => {
        let qweather_url_location = clock_rectangle;
        let city = defaultCity;

        if (data.status === "1") {
          // 直辖市city为空数组[]（truthy但无显示值），普通城市city为字符串"广州市"
          if (typeof data.city === "string" && data.city) {
            city = data.city;
          } else if (typeof data.province === "string" && data.province) {
            // 直辖市兜底：city为[]时使用province（如"重庆市"）
            city = data.province;
          }
          // rectangle 可能是空数组（API报错时）或字符串，必须检查类型
          if (typeof data.rectangle === "string" && data.rectangle) {
            // 解析 rectangle: "左下经度,左下纬度;右上经度,右上纬度" → 中心坐标
            const rects = data.rectangle.split(";");
            if (rects.length === 2) {
              const sw = rects[0].split(",");
              const ne = rects[1].split(",");
              if (sw.length === 2 && ne.length === 2) {
                const centerLng = (parseFloat(sw[0]) + parseFloat(ne[0])) / 2;
                const centerLat = (parseFloat(sw[1]) + parseFloat(ne[1])) / 2;
                qweather_url_location = centerLng.toFixed(6) + "," + centerLat.toFixed(6);
              }
            }
          }
        }

        fetchWeather(qweather_url_location, city);
      })
      .catch(err => {
        console.error("IP定位失败:", err);
        fetchWeather(clock_rectangle, defaultCity);
      });
  }
}
getIpInfo();

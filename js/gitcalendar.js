function GitCalendarInit(git_gitapiurl, git_color, git_user) {
  if (document.getElementById('git_container')) {
    var git_canlendar = (git_user, git_gitapiurl, git_color) => {
      var git_fixed = 'fixed';
      var git_px = 'px';
      var git_month = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
      var git_oneyearbeforeday = '';
      var git_thisday = '';
      var git_amonthago = '';
      var git_aweekago = '';
      var git_weekdatacore = 0;
      var git_datacore = 0;
      var git_total = 0;
      var git_datadate = '';
      var git_git_data = [];
      var git_positionplusdata = [];
      var git_firstweek = [];
      var git_lastweek = [];
      var git_beforeweek = [];
      var git_thisweekdatacore = 0;
      var git_mounthbeforeday = 0;
      var git_mounthfirstindex = 0;
      var git_crispedges = 'crispedges';
      var git_thisdayindex = 0;
      var git_amonthagoindex = 0;
      var git_amonthagoweek = [];
      var git_firstdate = [];
      var git_first2date = [];
      var git_montharrbefore = [];
      var git_monthindex = 0;

      var retinaCanvas = (canvas, context, ratio) => {
        if (ratio > 1) {
          var canvasWidth = canvas.width;
          var canvasHeight = canvas.height;
          canvas.width = canvasWidth * ratio;
          canvas.height = canvasHeight * ratio;
          canvas.style.width = '100%';
          canvas.style.height = canvasHeight + 'px';
          context.scale(ratio, ratio);
        }
      }

      // 清理所有悬浮提示
      var removeAllTooltips = function() {
        var tips = document.querySelectorAll('.gitmessage');
        for (var ti = 0; ti < tips.length; ti++) {
          tips[ti].remove();
        }
      };

      var responsiveChart = () => {
        if (document.getElementById("gitcanvas")) {
          git_positionplusdata = [];
          var git_tooltip_container = document.getElementById('git_tooltip_container');
          var ratio = window.devicePixelRatio || 1
          var git_span1 = '';
          var git_span2 = '';
          var git_calendar_c = document.getElementById("gitcanvas");
          git_calendar_c.style.width = '100%';
          git_calendar_c.style.height = '';
          var cmessage = document.getElementById("gitmessage");
          var git_calendar_ctx = git_calendar_c.getContext("2d");
          width = git_calendar_c.width = document.getElementById("gitcalendarcanvasbox").offsetWidth;
          height = git_calendar_c.height = 9 * 0.96 * git_calendar_c.width / git_data.length;
          retinaCanvas(git_calendar_c, git_calendar_ctx, ratio)
          var linemaxwitdh = height / 9;
          var lineminwitdh = 0.8 * linemaxwitdh;
          var setposition = {
            x: 0.02 * width,
            y: 0.025 * width
          };
          for (var week = 0; week < git_data.length; week++) {
            var weekdata = git_data[week];
            for (var day = 0; day < weekdata.length; day++) {
              var dataitem = {
                date: "",
                count: "",
                x: 0,
                y: 0
              };
              git_positionplusdata.push(dataitem);
              git_calendar_ctx.fillStyle = git_thiscolor(git_color, weekdata[day].count);
              setposition.y = Math.round(setposition.y * 100) / 100;
              dataitem.date = weekdata[day].date;
              dataitem.count = weekdata[day].count;
              dataitem.x = setposition.x;
              dataitem.y = setposition.y;
              git_calendar_ctx.fillRect(setposition.x, setposition.y, lineminwitdh, lineminwitdh);
              setposition.y = setposition.y + linemaxwitdh
            }
            setposition.y = 0.025 * width;
            setposition.x = setposition.x + linemaxwitdh;
          }
          if (document.body.clientWidth > 700) {
            git_calendar_ctx.font = "600  Arial";
            git_calendar_ctx.fillStyle = '#aaa';
            git_calendar_ctx.fillText("日", 0, 1.9 * linemaxwitdh);
            git_calendar_ctx.fillText("二", 0, 3.9 * linemaxwitdh);
            git_calendar_ctx.fillText("四", 0, 5.9 * linemaxwitdh);
            git_calendar_ctx.fillText("六", 0, 7.9 * linemaxwitdh);

            // 根据实际数据定位月份标签：遍历每周，月份变化时放置标签
            var month_label_x = 0.02 * width;
            var last_month = '';
            for (var wi = 0; wi < git_data.length; wi++) {
              if (git_data[wi].length > 0) {
                var month_str = git_data[wi][0].date.substring(5, 7);
                if (month_str !== last_month) {
                  last_month = month_str;
                  var month_label = git_month[parseInt(month_str, 10) - 1];
                  git_calendar_ctx.fillText(month_label, month_label_x, 0.7 * linemaxwitdh);
                }
              }
              month_label_x += linemaxwitdh;
            }
          }
          git_calendar_c.onmousemove = function(event) {
            removeAllTooltips();
            getMousePos(git_calendar_c, event)
          };
          git_tooltip_container.onmousemove = function(event) {
            removeAllTooltips();
          };

          var getMousePos = (canvas, event) => {
            var rect = canvas.getBoundingClientRect();
            // 使用逻辑尺寸(width/height)而非物理尺寸(canvas.width/height)
            // 因为 dataitem 坐标存储的是 retinaCanvas 缩放前的逻辑坐标
            var x = (event.clientX - rect.left) * (width / rect.width);
            var y = (event.clientY - rect.top) * (height / rect.height);
            for (var item of git_positionplusdata) {
              var lenthx = x - item.x;
              var lenthy = y - item.y;
              if (0 < lenthx && lenthx < lineminwitdh) {
                if (0 < lenthy && lenthy < lineminwitdh) {
                  git_span1 = item.date;
                  git_span2 = item.count;
                  // 悬浮框定位：底边中点对准格子上方
                  // 105 = 悬浮框半宽, 50 = 悬浮框高度 + 间距（依赖 .angle-wrapper CSS）
                  var cell_center_x = rect.left + (item.x + lineminwitdh / 2) * (rect.width / width);
                  var cell_top_y = rect.top + item.y * (rect.height / height);
                  var tip_x = cell_center_x - 105;
                  var tip_y = cell_top_y - 50;
                  html = tooltip_html(tip_x, tip_y, git_span1, git_span2);
                  append_div_gitcalendar(document.body, html)
                }
              }
            }
          }
        }
      }

      var addlastmonth = () => {
        if (git_thisdayindex === 0) {
          thisweekcore(52);
          thisweekcore(51);
          thisweekcore(50);
          thisweekcore(49);
          thisweekcore(48);
          git_thisweekdatacore += git_firstdate[6].count;
          git_amonthago = git_firstdate[6].date
        } else {
          thisweekcore(52);
          thisweekcore(51);
          thisweekcore(50);
          thisweekcore(49);
          thisweek2core();
          git_amonthago = git_first2date[git_thisdayindex - 1].date
        }
      }

      var thisweek2core = () => {
        for (var i = git_thisdayindex - 1; i < git_first2date.length; i++) {
          git_thisweekdatacore += git_first2date[i].count
        }
      }

      var thisweekcore = (index) => {
        for (var item of git_data[index]) {
          git_thisweekdatacore += item.count
        }
      }

      var addlastweek = () => {
        for (var item of git_lastweek) {
          git_weekdatacore += item.count
        }
      }

      var addbeforeweek = () => {
        for (var i = git_thisdayindex; i < git_beforeweek.length; i++) {
          git_weekdatacore += git_beforeweek[i].count
        }
      }

      var addweek = (data) => {
        if (git_thisdayindex === 6) {
          git_aweekago = git_lastweek[0].date;
          addlastweek()
        } else {
          lastweek = data.contributions[51];
          git_aweekago = lastweek[git_thisdayindex + 1].date;
          addlastweek();
          addbeforeweek()
        }
      }

      fetch(git_gitapiurl).then(data => data.json()).then(data => {
        if (document.getElementById('git_loading')) {
          document.getElementById('git_loading').remove()
        };
        git_data = data.contributions;
        git_total = data.total;
        git_first2date = git_data[48];
        git_firstdate = git_data[47];
        git_firstweek = data.contributions[0];
        git_lastweek = data.contributions[52];
        git_beforeweek = data.contributions[51];
        git_thisdayindex = git_lastweek.length - 1;
        git_thisday = git_lastweek[git_thisdayindex].date;
        git_oneyearbeforeday = git_firstweek[0].date;
        git_monthindex = git_thisday.substring(5, 7) * 1;
        // 使用 slice（非破坏性）保留 git_month 完整，供月份标签渲染使用
        var month_before = git_month.slice(git_monthindex);
        var month_after = git_month.slice(0, git_monthindex);
        var git_monthchange = month_before.concat(month_after);
        addweek(data);
        addlastmonth();
        var html = git_main_box(git_data, git_user, git_color, git_total, git_thisweekdatacore, git_weekdatacore, git_oneyearbeforeday, git_thisday, git_aweekago, git_amonthago);
        append_div_gitcalendar(git_container, html);
        responsiveChart()
      }).catch(function(error) {
        console.log(error)
      });
      window.onresize = function() {
        responsiveChart()
      };
      window.onscroll = function() {
        removeAllTooltips();
      };
      var git_thiscolor = (color, x) => {
        if (x === 0) {
          var i = parseInt(x / 2);
          return color[0]
        } else if (x < 2) {
          return color[1]
        } else if (x < 20) {
          var i = parseInt(x / 2);
          return color[i]
        } else {
          return color[9]
        }
      };
      var tooltip_html = (x, y, span1, span2) => {
        var html = '';
        html += `<div class="gitmessage" style="top:${y}px;left: ${x}px;position: fixed;z-index:9999;pointer-events: none;">
                          <div class="angle-wrapper" style="display:block;">
                            <span>${span1}&nbsp;</span>
                            <span>${span2}次上传</span>
                          </div>
                        </div>`;
        return html
      };
      var git_canvas_box = () => {
        var html = `<div id="gitcalendarcanvasbox">
                              <canvas id="gitcanvas" style="animation: none;">
                              </canvas>
                            </div>`;
        return html
      };
      var git_info_box = (user, color) => {
        var html = '';
        html += `<div id="git_tooltip_container"></div>
                        <div class="contrib-footer clearfix mt-1 mx-3 px-3 pb-1">
                          <div class="float-left text-gray">数据来源
                            <a href="https://github.com/${user}" target="blank">@${user}</a>
                          </div>
                          <div class="contrib-legend text-gray">Less
                            <ul class="legend">
                            <li style="background-color:${color[0]}"></li>
                            <li style="background-color:${color[2]}"></li>
                            <li style="background-color:${color[4]}"></li>
                            <li style="background-color:${color[6]}"></li>
                            <li style="background-color:${color[8]}"></li>
                            </ul>More
                          </div>
                        </div>`;
        return html
      };
      var git_main_box = (git_data, user, color, total, thisweekdatacore, weekdatacore, oneyearbeforeday, thisday, aweekago, amonthago) => {
        var html = '';
        var canvasbox = git_canvas_box();
        var infobox = git_info_box(user, color);
        html += `<div class="position-relative">
                          <div class="border py-2 graph-before-activity-overview">
                            <div class="js-gitcalendar-graph mx-md-2 mx-3 d-flex flex-column flex-items-end flex-xl-items-center overflow-hidden pt-1 is-graph-loading graph-canvas gitcalendar-graph height-full text-center">
                              ${canvasbox}
                            </div>
                            ${infobox}
                          </div>
                        </div>`;

        html += `<div style="display:flex;width:100%">
                          <div class="contrib-column contrib-column-first table-column">
                            <span class="text-muted">过去一年提交</span>
                            <span class="contrib-number">${total}</span>
                            <span class="text-muted">${oneyearbeforeday}&nbsp;-&nbsp;${thisday}</span>
                          </div>
                          <div class="contrib-column table-column">
                            <span class="text-muted">最近一月提交</span>
                            <span class="contrib-number">${thisweekdatacore}</span>
                            <span class="text-muted">${amonthago}&nbsp;-&nbsp;${thisday}</span>
                          </div>
                          <div class="contrib-column table-column">
                            <span class="text-muted">最近一周提交</span>
                            <span class="contrib-number">${weekdatacore}</span>
                            <span class="text-muted">${aweekago}&nbsp;-&nbsp;${thisday}</span>
                          </div>
                        </div>`;
        return html
      };
    };
    var append_div_gitcalendar = (parent, text) => {
      if (typeof text === 'string') {
        var temp = document.createElement('div');
        temp.innerHTML = text;
        var frag = document.createDocumentFragment();
        while (temp.firstChild) {
          frag.appendChild(temp.firstChild)
        }
        parent.appendChild(frag)
      } else {
        parent.appendChild(text)
      }
    };
    var git_container = document.getElementById('git_container');
    var git_loading = document.getElementById('git_loading');
    git_canlendar(git_user, git_gitapiurl, git_color)
  }
}

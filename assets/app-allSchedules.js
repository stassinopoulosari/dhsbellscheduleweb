(() => {
  var data = bellScheduleData,
    config = bellScheduleConfig,
    sanitize = (str) => {
      var el = document.createElement("div");
      el.innerText = str;
      return el.innerHTML
    },
    getData = () => {
      return new Promise(function(resolve, reject) {
        data.getSymbols().then((symbolsData) => {
          if (!symbolsData) {
            return reject({
              errorType: "symbolError",
              error: "Symbol data is not compliant."
            });
          }
          // var date = new Date();
          // data.getCalendar(date).then((calendarData) => {
          //   if (!calendarData || typeof(calendarData) != "string") {
          //     return reject({
          //       errorType: "calendarError",
          //       error: "Calendar data is not compliant."
          //     });
          //   }
          data.getAllSchedules().then((schedulesData) => {
            resolve({
              symbols: symbolsData,
              // calendar: calendarData,
              schedules: schedulesData
            });
          }).catch((scheduleError) => {
            reject({
              errorType: "scheduleError",
              error: scheduleError
            });
          });
          // }).catch((calendarError) => {
          //   reject({
          //     errorType: "calendarError",
          //     error: calendarError
          //   });
          // });
        }).catch((symbolError) => {
          reject({
            errorType: "symbolError",
            error: symbolError
          });
        });
      });
    } //,
  // getPeriodIndex = (date, schedule) => {
  //   for (var periodIndex in schedule) {
  //     var period = schedule[periodIndex];
  //     if (periodIndex == "name" ||
  //       typeof(period) != "object" ||
  //       !period.start ||
  //       !period.end) continue;
  //     var startDate = data.dateFromTimeString(date, period.start),
  //       endDate = data.dateFromTimeString(date, period.end);
  //     if (startDate.getTime() <= date.getTime() && endDate.getTime() > date.getTime()) return periodIndex;
  //   }
  //   return null;
  // }

  var $schedulesTable = document.querySelector("#schedulesTable"),
    $tableTemplate = '<li class="parent"><ul class="scheduleTable"><li class="title">{{name}}</li>{{content}}</ul>',
    $cellTemplate = '<li><div class="className">{{className}}</div><pre class="time">{{startTime}} — {{endTime}}</pre></li>';

  getData().then((bsData) => {
    var resolveSymbols = (text) => {
      var symbols = bsData.symbols,
        symbolKeys = Object.keys(symbols);
      var returnValue = text;
      symbolKeys.forEach((key) => {
        returnValue = returnValue.replace(new RegExp('\\$\\(' + key + '\\)'), symbols[key].value);
      });
      return returnValue;
    };
    if (!bsData.schedules) {
      $schedulesTable.innerHTML = '<li><div class="className">No schedules were found.</div></li>';
      return;
    }
    var schedules = bsData.schedules;

    var scheduleKeys = Object.keys(schedules).sort().filter((key) => {
        if (schedules[key].hidden) return false;
        return true;
      }),
      date = new Date(),
      newTable = "";
    // periodIndex = getPeriodIndex(date, schedule);
    // console.log(periodIndex);
    scheduleKeys.forEach((scheduleKey) => {
      var schedule = schedules[scheduleKey],
        name = schedule.name,
        keys = Object.keys(schedule).filter((key) => key != "name").sort(),
        contents = "";
      keys.forEach((key) => {
        var period = schedule[key],
          // isCurrent = periodIndex == key,
          startTime = data.displayTime(data.dateFromTimeString(date, period.start)),
          endTime = data.displayTime(data.dateFromTimeString(date, period.end)),
          className = resolveSymbols(period.name);
        contents += $cellTemplate.
        replace(/{{className}}/g, sanitize(className)).
        replace(/{{startTime}}/g, startTime.padStart(8)).
        replace(/{{endTime}}/g, endTime.padStart(8));
      });
      newTable += $tableTemplate
        .replace(/{{name}}/g, name)
        .replace(/{{content}}/g, contents);
    });
    $schedulesTable.innerHTML = newTable;
  }).catch((error) => {
    console.log(error);
    $schedulesTable.innerHTML = '<li><div class="className">Error.</div></li>';
  });

})();

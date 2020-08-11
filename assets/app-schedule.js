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
          var date = new Date();
          data.getCalendar(date).then((calendarData) => {
            if (!calendarData || typeof(calendarData) != "string") {
              return reject({
                errorType: "calendarError",
                error: "Calendar data is not compliant."
              });
            }
            data.getSchedule(date, calendarData).then((scheduleData) => {
              resolve({
                symbols: symbolsData,
                calendar: calendarData,
                schedule: scheduleData
              });
            }).catch((scheduleError) => {
              reject({
                errorType: "scheduleError",
                error: scheduleError
              });
            });
          }).catch((calendarError) => {
            reject({
              errorType: "calendarError",
              error: calendarError
            });
          });
        }).catch((symbolError) => {
          reject({
            errorType: "symbolError",
            error: symbolError
          });
        });
      });
    },
    getPeriodIndex = (date, schedule) => {
      for (var periodIndex in schedule) {
        var period = schedule[periodIndex];
        if (periodIndex == "name" ||
          typeof(period) != "object" ||
          !period.start ||
          !period.end) continue;
        var startDate = data.dateFromTimeString(date, period.start),
          endDate = data.dateFromTimeString(date, period.end);
        if (startDate.getTime() <= date.getTime() && endDate.getTime() > date.getTime()) return periodIndex;
      }
      return null;
    }

  var $scheduleTable = document.querySelector("#scheduleTable"),
    $template = '<li class="{{current}}"><div class="className">{{className}}</div><pre class="time">{{startTime}} — {{endTime}}</pre></li>';

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
    if (!bsData.schedule) {
      $scheduleTable.innerHTML = '<li><div class="className">No schedule was found for today.</div></li>';
      return;
    }
    var schedule = bsData.schedule;
    console.log(schedule);

    var keys = Object.keys(schedule).filter((key) => key != "name").sort();

    setInterval(() => {
      var currTable = $scheduleTable.innerHTML,
       newTable = "",
       date = new Date(),
       periodIndex = getPeriodIndex(date, schedule);
      console.log(periodIndex);
      keys.forEach((key) => {
        var period = schedule[key],
          isCurrent = periodIndex == key,
          startTime = data.displayTime(data.dateFromTimeString(date, period.start)),
          endTime = data.displayTime(data.dateFromTimeString(date, period.end)),
          className = resolveSymbols(period.name);
        newTable += $template.
        replace(/{{current}}/g, isCurrent ? "current" : "").
        replace(/{{className}}/g, sanitize(className)).
        replace(/{{startTime}}/g, startTime.padStart(8)).
        replace(/{{endTime}}/g, endTime.padStart(8));
      });
      if(currTable != newTable) $scheduleTable.innerHTML = newTable;
    }, 1000);

  }).catch(() => {
    $scheduleTable.innerHTML = '<li><div class="className">Error.</div></li>';
  });

})();

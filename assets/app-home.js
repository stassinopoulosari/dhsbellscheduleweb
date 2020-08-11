(() => {
  var data = bellScheduleData,
    config = bellScheduleConfig,
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
    getPeriod = (date, schedule) => {
    for (var periodIndex in schedule) {
      var period = schedule[periodIndex];
      if (periodIndex == "name") continue;
      var startDate = data.dateFromTimeString(date, period.start),
      endDate = data.dateFromTimeString(date, period.end);
      if(startDate.getTime() <= date.getTime() && endDate.getTime() > date.getTime()) return period;
    }
    return null;
  }

  var $endTimeView = document.querySelector("#endTimeView"),
  $startTimeView = document.querySelector("#startTimeView"),
  $countdownView = document.querySelector("#countdownView"),
  $classNameView = document.querySelector("#classNameView"),
  $infoLink = document.querySelector("#infoLink");

  const loadingAnimationStages = ["...","º..",".º.","..º"];
  var currAnimationStage = -1,
  loadingAnimationID = 0,
  startLoadingAnimation = () => {
    if(loadingAnimationID != 0) stopLoadingAnimation();
    loadingAnimationID = setInterval(() => {
      currAnimationStage++;
      if(currAnimationStage >= loadingAnimationStages.length) currAnimationStage = 0;
      $endTimeView.innerText = loadingAnimationStages[currAnimationStage];
    }, 100);
  };
  stopLoadingAnimation = () => {
    clearInterval(loadingAnimationID);
    $endTimeView.innerText = "";
  };
  startLoadingAnimation();

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
    window.resolveSymbols = resolveSymbols;
    stopLoadingAnimation();
    setInterval(() => {
      if(bsData.schedule == null) {
        $endTimeView.innerText = "No Class";
        [$startTimeView, $countdownView].forEach(($el) => $el.innerText = "");
        return;
      }
      console.log(new Date());
      var period = getPeriod(new Date(), bsData.schedule);
      console.log(period);
      if(period == null) {
        $endTimeView.innerText = "No Class";
        [$startTimeView, $countdownView].forEach(($el) => $el.innerText = "");
        return;
      }
      var date = new Date();
      $startTimeView.innerText = data.displayTime(data.dateFromTimeString(date, period.start));
      $endTimeView.innerText = data.displayTime(data.dateFromTimeString(date, period.end));
      var secsLeft = Math.floor((data.dateFromTimeString(date, period.end).getTime() - date.getTime()) / 1000);
      $countdownView.innerText = Math.floor(secsLeft / 60) + ":" + (secsLeft % 60 + "").padStart(2, "0");
      $classNameView.innerText = resolveSymbols(period.name);
    }, 500);
  }).catch((error) => {
    stopLoadingAnimation();
    $endTimeView.innerText = "Error";
    console.log(error)
  });

})();

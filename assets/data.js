(() => {
  var config = window.bellScheduleConfig,
    getPath = (pathString) => {
      return firebase.database().ref(pathString);
    },
    getValue = (path) => {
      return path.once("value");
    },
    dateComponents = (date) => {
      return {
        year: date.getYear() + 1900,
        month: date.getMonth() + 1,
        day: date.getDate(),
        paddedMonth: ((date.getMonth() + 1) + "").padStart(2, "0")
      };
    },
    dateFromTimeString = (date, timeString) => {
      var returnValue = new Date(date),
        timeStringComponents = timeString.split(":"),
        hours = timeStringComponents[0],
        minutes = timeStringComponents[1];
      returnValue.setHours(hours);
      returnValue.setMinutes(minutes);
      returnValue.setSeconds(0);
      returnValue.setMilliseconds(0);
      return returnValue;
    },
    displayTime = (date) => {
      var hours = date.getHours();
      var minutes = date.getMinutes();
      return (hours % 12 == 0 ? 12 : hours % 12) + ":" + (minutes + "").padStart(2, "0") + (hours < 12 ? " AM" : " PM");
    },
    getCalendar = (date) => {
      return new Promise(function(resolve, reject) {
        var components = dateComponents(date),
          calendarPathString = "schools/" +
          config.schoolIdentifier +
          "/calendars/" +
          components.year +
          "/" +
          components.paddedMonth,
          calendarPath = getPath(calendarPathString);
        console.log(calendarPathString);
        return getValue(calendarPath).catch(reject).then((data) => {
          return resolve(data.val());
        });
      });
    },
    getSchedule = (date, calendar) => {
      return new Promise(function(resolve, reject) {
        var splitCalendar = calendar.split(","),
          components = dateComponents(date),
          day = components.day;
        if (splitCalendar.length <= day) {
          return reject("Calendar not long enough.");
        }
        var scheduleIdentifier = splitCalendar[day],
          schedulePathString = "schools/" +
          config.schoolIdentifier +
          "/schedules/" +
          scheduleIdentifier,
          schedulePath = getPath(schedulePathString);
        console.log(schedulePathString);
        if (scheduleIdentifier == "") {
          return resolve(null);
        }
        return getValue(schedulePath).catch(reject).then((data) => {
          return resolve(data.val());
        });
      });
    },
    getAllSchedules = () => {
      return new Promise(function(resolve, reject) {

        // var scheduleIdentifier = splitCalendar[day],
        var schedulePathString = "schools/" +
          config.schoolIdentifier +
          "/schedules",
          schedulePath = getPath(schedulePathString);
        return getValue(schedulePath).catch(reject).then((data) => {
          return resolve(data.val());
        });
      });
    },
    getSymbols = () => {
      return new Promise(function(resolve, reject) {
        var symbolsPathString = "schools/" +
          config.schoolIdentifier +
          "/symbols/",
          symbolsPath = getPath(symbolsPathString);
        getValue(symbolsPath).catch(reject).then((data) => {
          resolve(data.val());
        });
      });
    };
  window.bellScheduleData = {
    dateComponents: dateComponents,
    getCalendar: getCalendar,
    getSchedule: getSchedule,
    getAllSchedules: getAllSchedules,
    getSymbols: getSymbols,
    dateFromTimeString: dateFromTimeString,
    displayTime: displayTime
  };
})();

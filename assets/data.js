var config = window.bellScheduleConfig,
  cache = null,
  cachePath = (path, value) => {
    cache[path] = value;
    saveCache();
  },
  retrievePath = (path) => {
    if (cache === null) loadCache();
    return cache[path];
  },
  saveCache = () => {
    localStorage.setItem("bsa_cache", JSON.stringify(cache));
  },
  loadCache = () => {
    try {
      cache = JSON.parse(localStorage.getItem("bsa_cache"));
      if (cache === null) cache = {};
    } catch {
      cache = {};
    }
  },
  invalidateCache = () => {
    localStorage.removeItem("bsa_cache");
  },
  getPath = (pathString) => {
    return firebase.database().ref(pathString);
  },
  getValue = (path, bypassCache) => {
    const cachedValue = retrievePath(path.toString());
    if (cachedValue === undefined || bypassCache)
      return new Promise((resolve, reject) =>
        path
          .once("value")
          .then((snapshot) => {
            const val = snapshot.val();
            console.log(val);
            console.log(
              !bypassCache
                ? `Cache miss, saving ${path.toString()}`
                : "Bypass cache",
            );
            if (!bypassCache) cachePath(path.toString(), val);
            resolve({ val: () => val });
          })
          .catch(reject),
      );
    console.log(`Cache hit for path ${path.toString()}`);
    return Promise.resolve({ val: () => cachedValue });
  },
  dateComponents = (date) => {
    return {
      year: date.getYear() + 1900,
      month: date.getMonth() + 1,
      day: date.getDate(),
      paddedMonth: (date.getMonth() + 1 + "").padStart(2, "0"),
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
    return (
      (hours % 12 == 0 ? 12 : hours % 12) +
      ":" +
      (minutes + "").padStart(2, "0") +
      (hours < 12 ? " AM" : " PM")
    );
  },
  getCalendar = (date) => {
    return new Promise(function (resolve, reject) {
      var components = dateComponents(date),
        calendarPathString =
          "schools/" +
          config.schoolIdentifier +
          "/calendars/" +
          components.year +
          "/" +
          components.paddedMonth,
        calendarPath = getPath(calendarPathString);
      console.log(calendarPathString);
      return getValue(calendarPath)
        .catch(reject)
        .then((data) => {
          return resolve(data.val());
        });
    });
  },
  getSchedule = (date, calendar) => {
    return new Promise(function (resolve, reject) {
      var splitCalendar = calendar.split(","),
        components = dateComponents(date),
        day = components.day;
      if (splitCalendar.length <= day) {
        return reject("Calendar not long enough.");
      }
      var scheduleIdentifier = splitCalendar[day],
        schedulePathString =
          "schools/" +
          config.schoolIdentifier +
          "/schedules/" +
          scheduleIdentifier,
        schedulePath = getPath(schedulePathString);
      console.log(schedulePathString);
      if (scheduleIdentifier == "") {
        return resolve(null);
      }
      return getValue(schedulePath)
        .catch(reject)
        .then((data) => {
          return resolve(data.val());
        });
    });
  },
  getAllSchedules = () => {
    return new Promise(function (resolve, reject) {
      // var scheduleIdentifier = splitCalendar[day],
      var schedulePathString =
          "schools/" + config.schoolIdentifier + "/schedules",
        schedulePath = getPath(schedulePathString);
      return getValue(schedulePath)
        .catch(reject)
        .then((data) => {
          return resolve(data.val());
        });
    });
  },
  getSymbols = () => {
    return new Promise(function (resolve, reject) {
      var symbolsPathString =
          "schools/" + config.schoolIdentifier + "/symbols/",
        symbolsPath = getPath(symbolsPathString);
      getValue(symbolsPath)
        .catch(reject)
        .then((data) => {
          resolve(data.val());
        });
    });
  };

const lastUpdatedSnapshot = await getValue(
    getPath("schools/" + config.schoolIdentifier + "/lastUpdated"),
    true,
  ),
  lastUpdated = lastUpdatedSnapshot.val();
if (typeof lastUpdated === "number") {
  const localLastUpdated = parseInt(
    localStorage.getItem("bsa_cache_lastupdated"),
  );
  if (isNaN(localLastUpdated) || parseInt(localLastUpdated) < lastUpdated) {
    console.log("Invalidate cache");
    invalidateCache();
    localStorage.setItem("bsa_cache_lastupdated", lastUpdated);
  }
}

export {
  dateComponents,
  getCalendar,
  getSchedule,
  getAllSchedules,
  getSymbols,
  dateFromTimeString,
  displayTime,
};

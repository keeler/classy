const COLORS = ["rgb(32,142,183)", "rgb(132,36,26)", "rgb(134,204,49)", "rgb(166,29,153)", "rgb(20,229,75)", "rgb(249,104,195)", "rgb(79,133,34)", "rgb(123,38,229)", "rgb(219,201,7)", "rgb(31,55,120)", "rgb(35,219,225)", "rgb(243,59,93)", "rgb(11,69,18)", "rgb(228,184,236)", "rgb(80,53,37)", "rgb(167,205,216)", "rgb(173,118,107)", "rgb(83,113,213)", "rgb(246,147,46)", "rgb(194,205,132)"]
const WEEKDAYS = "MTWRF".split("");
const WEEKDAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

var MINUTES_PER_ROW = 10;
var BREAKDOWN = "room";

// Reset to breakdown radio button on page reload.
const defaultBreakdownRadio = document.getElementById(`breakdown-by-${BREAKDOWN}`);
defaultBreakdownRadio.checked = true;

const handleFileUpload = (event) => {
  if (event.target.files.length > 1) {
    alert("Only one file upload allowed at a time.");
    return;
  }

  const file = event.target.files[0];
  if (!file) {
    alert("No file uploaded!")
    return;
  }

  const reader = new FileReader();
  reader.onload = parseAndRenderFile;
  reader.readAsText(file);
}

document.getElementById('fileinput').addEventListener('change', handleFileUpload);

const renderIfFilePresent = () => {
  const uploadedFiles = document.getElementById("fileinput").files;
  if (uploadedFiles.length < 1) {
    return;
  }

  const file = uploadedFiles[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = parseAndRenderFile;
  reader.readAsText(file);
}

const handleMinsPerRowChange = () => {
  MINUTES_PER_ROW = parseInt(document.getElementById("minsPerRowSelect").value);
  renderIfFilePresent();
}

const handleBreakdownChanged = (radio) => {
  BREAKDOWN = radio.value;
  renderIfFilePresent();
}

const parseAndRenderFile = (event) => {
  const contents = event.target.result;
  const lines = contents.split("\n");
  const headers = parseCsvRow(lines[0]);

  const rawData = lines.slice(1).map((line) => {
    const rowData = parseCsvRow(line);
    const result = Object.fromEntries(headers.map((k, i) => [k, rowData[i]]));
    return result;
  });

  // Render the calendar table.
  const cleanData = cleanRawData(rawData);
  const calendarHtml = renderCalendarHtml(cleanData);
  const root = document.getElementById("root");
  root.innerHTML = calendarHtml;
};

const renderCalendarHtml = (data) => {
  const filteredData = data.filter(course => {
    if (BREAKDOWN === "room") {
      // If showing breakdown by room, remove courses with no room.
      return course.roomNumber;
    }
    return true;
  });
  const breakdown = unique(filteredData.map(course => getBreakdownField(course))).sort();
  var calendar = "<table>"

  // Set up multi-column header.
  calendar += (
    "<col>"
    + WEEKDAYS.map(x => (
      `<colgroup span="${breakdown.length}"></colgroup>`
    )).join("")
  );

  // Render weekday headers.
  calendar += (
    `<tr>`
    + `<td rowspan="2"><b>Time</b<</td>`
    + WEEKDAYS.map((_, i) => (
      `<th colspan="${breakdown.length}" scope="colgroup">${WEEKDAY_LABELS[i]}</th>`
    )).join("\n")
    + `</tr>`
  );

  // Render room number headers.
  calendar += (
    `<tr>`
    + WEEKDAYS.map(weekday => (
      breakdown.map(category => (
        `<th scope="col">${category}</th>`
      )).join("\n")
    )).join("\n")
    + `</tr>`
  );

  // Render courses as cells in table.
  const cells = getCellContents(filteredData, breakdown);
  calendar += cells.map(row => {
    const rowContents = (
      `<tr>`
      + row.map((col, index) => {
        if (index === 0) {
          return `<th scope="row">${col.textContents}</th>`;
        } else {
          const cellStyle = col.style
            ? `style="${Object.entries(col.style).map(([k, v]) => `${k}:${v}`).join(';')}"`
            : "";
          const cellClass = col.cssClass
            ? `class=${col.cssClass}`
            : "";
          return `<td ${cellClass} ${cellStyle}>${col.textContents}</td>`
        }
      }).join("\n")
      + `</tr>`
    )
    return rowContents;
  }).join("\n");

  calendar += "</table>";
  return calendar;
}

const getCellContents = (data, breakdown) => {
  const parseTime = (timeStr) => {
    const hour = timeStr.substr(0, 2);
    const mins = timeStr.substr(3, 2);
    const timeResult = Number(hour) + Number(mins) / 60;
    return timeResult;
  };

  const minHour = Math.trunc(Math.min(...data.map(x => parseTime(x.startTime))));
  const maxHour = Math.trunc(Math.max(...data.map(x => parseTime(x.endTime)))) + 1;

  // One col for time, then for each room on each weekday.
  const numCols = 1 + WEEKDAYS.length * breakdown.length;
  const numRows = (maxHour - minHour) * 60 / MINUTES_PER_ROW;
  const timeForRow = (rowNum) => {
    const t = minHour * 60 + rowNum * MINUTES_PER_ROW;
    const h = String(parseInt(t / 60)).padStart(2, "0");
    const m = String(parseInt(t % 60)).padStart(2, "0");
    return `${h}:${m}`
  }
  var cellsInGrid = range(numRows).map(r => range(numCols).map(c => {
    const isTuesdayOrThursday = () => {
      const dayOfWeek = (
        Math.trunc(
          (c - 1)  // Subtract first col for time.
          / breakdown.length
        )
      )
      return [1, 3].includes(dayOfWeek)
    }
    return {
      // Set first col to time.
      textContents: c === 0 ? timeForRow(r) : " ",
      style: {
        "background-color": (
          isTuesdayOrThursday()
          ? "lightGrey"
          : "white"
        ),
      },
      cssClass: "emptyCell"
    }
  }));

  // Map course names to colors. Some courses have class and lab, e.g. 210 and 210L.
  // The lab and class of the same course should have the same color.
  const courseNames = unique(data.map(x => x.name.replace(/L$/, ''))).sort();
  if (courseNames.length > COLORS.length) {
    alert(`I only know ${COLORS.length} colors but you gave me ${courseNames.length} courses to display.`);
    return cellsInGrid;
  }
  const getColor = (courseName) => COLORS[courseNames.indexOf(courseName.replace(/L$/, ''))];

  data.forEach((course) => {
    course.days.split("").forEach((day) => {
      const startTime = parseTime(course.startTime);
      const endTime = parseTime(course.endTime);

      const col = (
        1 // For time column
        + WEEKDAYS.indexOf(day) * breakdown.length
        + breakdown.indexOf(getBreakdownField(course))
      );
      const firstRow = Math.trunc((startTime - minHour) * 60 / MINUTES_PER_ROW);
      const lastRow = Math.trunc((endTime - minHour) * 60 / MINUTES_PER_ROW);
      const middleRow = Math.trunc((lastRow + firstRow) / 2);

      range(lastRow - firstRow + 1).forEach(i => {
        row = i + firstRow;
        const cellColor = getColor(course.name);
        const currentCell = cellsInGrid[row][col];
        currentCell.style["background-color"] = cellColor;
        currentCell.style["color"] = pickTextColorBasedOnBgColorSimple(cellColor, "white", "black");
        currentCell.cssClass = "courseCell";
        if (row === firstRow) {
          currentCell.textContents += course.startTime;
          currentCell.cssClass = "courseTopCell";
        } else if (row === middleRow) {
          const courseLabel = [
            course.subject,
            course.number,
            course.roomNumber
              ? `${course.building}${course.roomNumber}`
              : "N/A"
          ];
          courseLabel.forEach((textValue, index) => {
            const rowOffset = -1;
            const cellAtIndex = cellsInGrid[row + index + rowOffset][col];
            cellAtIndex.textContents = textValue;
          })
        } else if (row === lastRow) {
          currentCell.textContents += course.endTime;
          currentCell.cssClass = "courseBottomCell";
        }
      });
    })
  });

  return cellsInGrid;
};

const cleanRawData = (rawData) => {
  const formatTime = (timeStr) => {
    const padded = timeStr.padStart(4, "0");
    const result = `${padded.substr(0, 2)}:${padded.substr(2, 2)}`;
    return result;
  }
  const result = rawData
    .filter((row) => {
      return (
        row["Status"] !== "Reserved"
        && row["Start Time"]
        && row["End Time"]
      );
    })
    .map((row) => ({
      "subject": row["Subject"],
      "number": row["Course"],
      "name": `${row["Subject"]} ${row["Course"]}`,
      "title": row["Title"],
      "courseId": row["CRN"],
      "startTime": formatTime(row["Start Time"]),
      "endTime": formatTime(row["End Time"]),
      "days": row["Days"],
      "building": row["Bldg"],
      "roomNumber": row["Room"],
    }));

  return result;
};

// Parse a CSV row, accounting for commas inside quotes
const parseCsvRow = (row) => {
  var insideQuote = false,
    entries = [],
    entry = [];
  row.split('').forEach(function (character) {
    if (character === '"') {
      insideQuote = !insideQuote;
    } else {
      if (character == "," && !insideQuote) {
        entries.push(entry.join(''));
        entry = [];
      } else {
        entry.push(character);
      }
    }
  });
  entries.push(entry.join(''));
  return entries;
}

const pickTextColorBasedOnBgColorSimple = (bgColor, lightColor, darkColor) => {
  var color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
  var r = parseInt(color.substring(0, 2), 16); // hexToR
  var g = parseInt(color.substring(2, 4), 16); // hexToG
  var b = parseInt(color.substring(4, 6), 16); // hexToB
  return (((r * 0.299) + (g * 0.587) + (b * 0.114)) > 186) ?
    darkColor : lightColor;
}

const getBreakdownField = (course) => {
  switch (BREAKDOWN) {
    case "room":
      return course.roomNumber;
    case "course":
      return course.number;
  }
}
const range = (n) => [...Array(n).keys()];
const unique = (items) => [...new Set(items)];

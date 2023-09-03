const COLORS = ['#88CCEE', '#44AA99', '#117733', '#332288', '#DDCC77', '#999933','#CC6677', '#882255', '#AA4499', '#DDDDDD']
const WEEKDAYS = "MTWRF".split("");
const WEEKDAY_LABELS = ["Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays"]
const MIN_HOUR = 8; // 8am
const MAX_HOUR = 22;  // 10pm
const MINUTES_PER_ROW = 5;

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

const parseAndRenderFile = (event) => {
  const contents = event.target.result;
  const lines = contents.split("\n");
  const headers = parseCsvRow(lines[0]);

  const rawData = lines.slice(1).map((line, index) => {
     const rowData = parseCsvRow(line);
     const result = Object.fromEntries(headers.map((k, i) => [k, rowData[i]]));
     return result;
  });

  const cleanData = cleanRawData(rawData);
  const calendarHtml = renderCalendarHtml(cleanData);
  const root = document.getElementById("root");
  root.innerHTML = calendarHtml;
};


const renderCalendarHtml = (data) => {
  const rooms = unique(data.map(x => x.roomNumber)).sort();
  var calendar = "<table>"

  // Set up multi-column header.
  calendar += (
    "<col>"
    + WEEKDAYS.map(x => (
      `<colgroup span="${rooms.length}"></colgroup>`
    )).join("")
  );

  // Render weekday headers.
  calendar += (
    `<tr>`
    + `<td rowspan="2"><b>Time</b<</td>`
    + WEEKDAYS.map((_, i) => (
      `<th colspan="${rooms.length}" scope="colgroup">${WEEKDAY_LABELS[i]}</th>`
      )).join("\n")
    + `</tr>`
  );

  // Render room number headers.
  calendar += (
    `<tr>`
    + WEEKDAYS.map(weekday => (
      rooms.map(room => (
        `<th scope="col">${room}</th>`
      )).join("\n")
    )).join("\n")
    + `</tr>`
  );

  const cells = getCellContents(data, rooms);
  calendar += cells.map(row => {
    const rowContents = (
      `<tr>`
      + row.map((col, index) => {
        if (index === 0) {
          return `<th scope="row">${col.textContents}</th>`;
        } else {
          const cellStyle = Object.entries(col.style).map(([k, v]) => `${k}:${v}`).join(';')
          return `<td style="${cellStyle}">${col.textContents}</td>`
        }
      }).join("\n")
      + `</tr>`
    )
    return rowContents;
  }).join("\n");

  calendar += "</table>";
  return calendar;
}

const getCellContents = (data, rooms) => {
  // One col for time, then for each room on each weekday.
  const numCols = 1 + WEEKDAYS.length * rooms.length;
  const minutesPerRow = 5;
  const numRows = (MAX_HOUR - MIN_HOUR) * 60 / minutesPerRow;
  const timeForRow = (rowNum) => {
    const t = MIN_HOUR * 60 + rowNum * minutesPerRow;
    const h = String(parseInt(t/60)).padStart(2, "0");
    const m = String(parseInt(t % 60)).padStart(2, "0");
    return `${h}:${m}`
  }
  var cellsInGrid = range(numRows).map(r => range(numCols).map(c => (
    {
      // Set first col to time.
      textContents: c === 0 ? timeForRow(r) : " ",
      style: {
        "background-color": "white",
      }
    }
  )));

  // Map course names to colors. Some courses have class and lab, e.g. 210 and 210L.
  // The lab and class of the same course should have the same color.
  const courseNames = unique(data.map(x => x.name.replace(/L$/, ''))).sort();
  if (courseNames.length > COLORS.length) {
    alert("Not enough colors to display all courses");
    return cellsInGrid;
  }
  const getColor = (courseName) => COLORS[courseNames.indexOf(courseName.replace(/L$/, ''))];

  const parseTime = (timeStr) => {
    const hour = timeStr.padStart(4, "0").substr(0, 2);
    const mins = timeStr.padStart(4, "0").substr(2, 2);
    const timeResult = Number(hour) + Number(mins) / 60;
    return timeResult;
  };

  data.forEach((course) => {
    course.days.split("").forEach((day) => {
      const startTime = parseTime(course.startTime);
      const endTime = parseTime(course.endTime);

      const col = (
        1 // For time column
        + WEEKDAYS.indexOf(day) * rooms.length
        + rooms.indexOf(course.roomNumber)
      );
      const firstRow = Math.trunc((startTime - MIN_HOUR) * 60 / minutesPerRow);
      const lastRow = Math.trunc((endTime - MIN_HOUR) * 60 / minutesPerRow);
      const middleRow = Math.trunc((lastRow + firstRow) / 2);

      range(lastRow - firstRow + 1).forEach(i => {
        row = i + firstRow;
        const cellColor = getColor(course.name);
        cellsInGrid[row][col].style["background-color"] = cellColor;
        cellsInGrid[row][col].style["color"] = pickTextColorBasedOnBgColorSimple(cellColor, "white", "black");
        if (row === firstRow) {
          cellsInGrid[row][col].textContents += course.startTime;
        } else if (row === middleRow) {
          cellsInGrid[row][col].textContents += course.name;
        } else if (row === lastRow) {
          cellsInGrid[row][col].textContents += course.endTime;
        }
      });
    })
  });

  return cellsInGrid;
};

const cleanRawData = (rawData) => {
  const result = rawData
    .filter((row) => {
      return (
        row["Status"] !== "Reserved" &&
        row["Start Time"] &&
        row["End Time"] &&
        row["Room"] &&
        row["Bldg"] == "HH"
      );
    })
    .map((row) => ({
      "subject": row["Subject"],
      "number": row["Course"],
      "name": `${row["Subject"]} ${row["Course"]}`,
      "title": row["Title"],
      "courseId": row["CRN"],
      "startTime": row["Start Time"],
      "endTime": row["End Time"],
      "days": row["Days"],
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
    if(character === '"') {
      insideQuote = !insideQuote;
    } else {
      if(character == "," && !insideQuote) {
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

const range = (n) => [...Array(n).keys()];
const unique = (items) => [...new Set(items)];

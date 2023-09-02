const WEEKDAYS = "MTWRF".split("");
const MIN_HOUR = 6; // 6am
const MAX_HOUR = 17;  // 5pm
const MINUTES_PER_ROW = 5;

const handleFileUpload = (event) => {
  if (event.target.files.length > 1) {
    throw Error("Only one file upload allowed at a time.")
  }

  const file = event.target.files[0];
  if (!file) {
    alert("No file uploaded!")
  }

  const reader = new FileReader();
  reader.onload = parseAndRenderFile;
  reader.readAsText(file);
}

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

document.getElementById('fileinput').addEventListener('change', handleFileUpload);

const renderCalendarHtml = (data) => {
  const rooms = [...new Set(data.map(x => x.roomNumber))];

  var calendar = "<table>"

  // Set up multi-column header.
  calendar += (
    "<col>"
    + [...Array(WEEKDAYS.length).keys()]
        .map(x => `<colgroup span="${rooms.length}"></colgroup>`)
        .join("")
  );

  // Render weekday headers.
  calendar += (
    `<tr>`
    + `<td rowspan="2"><b>Time</b<</td>`
    + WEEKDAYS.map(weekday => `<th colspan="${rooms.length}" scope="colgroup">${weekday}</th>`).join("\n")
    + `</tr>`
  );

  // Render room number headers.
  calendar += (
    `<tr>`
    + WEEKDAYS.map(weekday => {
      return rooms.map(room => `<th scope="col">${room}</th>`).join("\n")
    }).join("\n")
    + `</tr>`
  );

  calendar += "</table>";

  return calendar;
}

const cleanRawData = (rawData) => {
  const result = rawData
    .filter((row) => {
      return (
        row["Status"] !== "Reserved" &&
        row["Start Time"] &&
        row["End Time"] &&
        row["Room"]
      );
    })
    .map((row) => ({
      "subject": row["Subject"],
      "courseNumber": row["Course"],
      "course": `${row["Subject"]} ${row["Course"]}`,
      "courseTitle": row["Title"],
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

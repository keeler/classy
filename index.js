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
  console.log("CLEAN", cleanData)
};

document.getElementById('fileinput').addEventListener('change', handleFileUpload);

const cleanRawData = (rawData) => {
  const result = rawData
    .filter((row) => {
      return (
        row["Status"] !== "Reserved" &&
        row["Start Time"] !== "" &&
        row["End Time"] !== ""
      );
    })
    .map((row) => ({
      "subject": row["Subject"],
      "courseNumber": row["Course"],
      "courseTitle": row["Title"],
      "courseId": row["CRN"],
      "startTime": row["Start Time"],
      "endTime": row["End Time"],
      "days": row["Days"],
      "roomNumber": row["Room"],
    }));
  return result;
};

const parseInputFile = (file) => {
}

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

const createCalendarTable = (parentElement) => {
  const table = document.createElement("table");
  parentElement.appendChild(table);

  const headerNames = ["Time", ...WEEKDAYS];
  // Set up the table header.
  const header = document.createElement("tr");
  table.appendChild(header);
  headerNames.forEach((weekday) => {
    const colHeader = document.createElement("th");
    colHeader.textContent = weekday;
    header.appendChild(colHeader);
  });

  // Set up the table contents.
  const tableBody = document.createElement("tbody");
  table.appendChild(tableBody);
  const numRows = (MAX_HOUR - MIN_HOUR) * 60 / MINUTES_PER_ROW;
  [...Array(numRows).keys()].forEach((rowNumber) => {
    const tableRow = document.createElement("tr");
    tableBody.appendChild(tableRow);
    headerNames.forEach((header, index) => {
      const rowCell = document.createElement("td");
      if (index === 0) {
        rowCell.textContent = rowNumber * 5;
      } else {
        rowCell.textContent = header;
      }
      tableRow.appendChild(rowCell);
    })
  });
};

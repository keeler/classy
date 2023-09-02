const WEEKDAYS = "MTWRF".split("");
const MIN_HOUR = 6; // 6am
const MAX_HOUR = 17;  // 5pm
const MINUTES_PER_ROW = 5;

const handleFileUpload = (event) => {
  if (event.target.files.length > 1) {
    throw Error("Only one file upload allowed at a time.")
  }

  const file = event.target.files[0];
  renderFile(file);
}

const renderFile = (file) => {
  if (!file) {
    alert("No file uploaded!")
  }

  const rawData = [];

  const reader = new FileReader();
  reader.onload = (event) => {
    const contents = event.target.result;
    const lines = contents.split("\n");
    var headers = [];

    lines.forEach((line, index) => {
      if (index === 0) {
        headers = parseCsvRow(line);
      } else {
        const rowData = parseCsvRow(line);
        const result = Object.fromEntries(headers.map((k, i) => [k, rowData[i]]));
        rawData.push(result);
      }
    });
  };

  reader.readAsText(file);
  console.log("rawDAta", rawData)
  console.log("rawDAta2", rawData)



}

document.getElementById('fileinput').addEventListener('change', handleFileUpload);

const cleanRawData = (rawData) => {
  const filteredData = structuredClone(rawData).filter((row) => {
      return true;
   });
  const result = filteredData.map((row) => (
      {
        "subject": row["Subject"],
        "courseNumber": row["Course"],
        "courseTitle": row["Title"],
        "courseId": row["CRN"],
        "startTime": row["Start Time"],
        "endTime": row["End Time"],
        "days": row["Days"],
        "roomNumber": row["Room"],
      }
    ));
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

const getScheduleData = () => {
  return [
    {
      department: "BIOL",
      classNumber: 102,
      startTime: "0800",
      endTime: "0915",
      days: "MWR",
      building: "Hubbard",
      roomNumber: 301,
    },
    {
      department: "BIOL",
      classNumber: 106,
      startTime: "0900",
      endTime: "1015",
      days: "MR",
      building: "Hubbard",
      roomNumber: 401,
    },
    {
      department: "CHEM",
      classNumber: 206,
      startTime: "0900",
      endTime: "0945",
      days: "MWR",
      building: "McKinley",
      roomNumber: 301,
    }
  ]
}

document.addEventListener("DOMContentLoaded", (event) => main());

const WEEKDAYS = "MTWRF".split("");
const MIN_HOUR = 6; // 6am
const MAX_HOUR = 17;  // 5pm
const MINUTES_PER_ROW = 5;

const main = () => {
  const rootElement = document.getElementById("root")
  createCalendarTable(rootElement);
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

function readSingleFile(evt) {
  var f = evt.target.files[0];
  if (f) {
    var r = new FileReader();
    r.onload = function(e) {
        var contents = e.target.result;
        document.write("File Uploaded! <br />" + "name: " + f.name + "<br />" + "content: " + contents + "<br />" + "type: " + f.type + "<br />" + "size: " + f.size + " bytes <br />");

        var lines = contents.split("\n"), output = [];
        for (var i=0; i<lines.length; i++){
          output.push("<tr><td>" + lines[i].split(",").join("</td><td>") + "</td></tr>");
        }
        output = "<table>" + output.join("") + "</table>";
        document.write(output);
   }
    r.readAsText(f);
    document.write(output);
  } else {
    alert("Failed to load file");
  }
}
document.getElementById('fileinput').addEventListener('change', readSingleFile);

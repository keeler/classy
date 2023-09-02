document.addEventListener("DOMContentLoaded", (event) => main());

const WEEKDAYS = "MTWRF".split("");
const COLUMN_WIDTH = 150;
const TOTAL_WIDTH = WEEKDAYS.length * COLUMN_WIDTH;
const HOUR_HEIGHT = 60;
const MIN_HOUR = 6; // 6am
const MAX_HOUR = 17;  // 5pm
const TOTAL_HEIGHT = (MAX_HOUR - MIN_HOUR) * HOUR_HEIGHT;
const TIME_LABEL_OFFSET = 50;

const BUTTON_RADIUS = 20

const main = () => {
    const rootElement = document.getElementById("root")
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.setAttributeNS(null, "viewBox", "-1 0 1000 1000")

    createCalendarGrid(svg)
    root.appendChild(svg)
}

const createCalendarGrid = (svgElement) => {
  // Overall border rect
  const yOffset = 10;
  const outsideBorder = rect(TIME_LABEL_OFFSET, yOffset, TOTAL_WIDTH, TOTAL_HEIGHT);
  svgElement.appendChild(outsideBorder);

  // Column rects + labels
  WEEKDAYS.forEach((weekday, index) => {
    const colX = TIME_LABEL_OFFSET + COLUMN_WIDTH * index;
    const columnRect = rect(colX, yOffset, COLUMN_WIDTH, TOTAL_HEIGHT);
    svgElement.appendChild(columnRect);

    const labelX = colX + COLUMN_WIDTH / 2;
    const labelText = weekday;
    const colLabel = text(labelX, yOffset + HOUR_HEIGHT/2, labelText);
    svgElement.appendChild(colLabel);
  });

  // Time lines + labels
  const numHours = (MAX_HOUR - MIN_HOUR);
  [...Array(numHours).keys()].forEach((i) => {
    const lineY = (i + 1) * HOUR_HEIGHT;
    const line = horizontalLine(TIME_LABEL_OFFSET, TIME_LABEL_OFFSET + TOTAL_WIDTH, lineY);
    svgElement.appendChild(line);

    const labelName = (MIN_HOUR + i).toString();
    const label = text(0, lineY, labelName);
    svgElement.appendChild(label);
  });
};

const text = (x, y, content) => {
  const textElem = getElement("text", {
    x: x,
    y: y
  });
  textElem.textContent = content;
  return textElem;
}

const horizontalLine = (x1, x2, y) => {
  return getElement("line", {
    stroke: "grey",
    "stroke-dasharray": "5,5",
    x1: x1,
    x2: x2,
    y1: y,
    y2: y
  });
}

const rect = (x, y, w, h) => {
  return getElement("rect", {
    fill: "none",
    stroke: "black",
    x: x,
    y: y,
    width: w,
    height: h
  });
};

const getElement = (name, properties) => {
    const element = document.createElementNS("http://www.w3.org/2000/svg", name)
    for (const prop in properties) {
        element.setAttributeNS(null, prop, properties[prop])
    }
    return element
}

const data = () => {
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

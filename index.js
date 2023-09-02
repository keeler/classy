document.addEventListener("DOMContentLoaded", (event) => main());

const WEEKDAYS = "MTWRF".split("");
const COLUMN_WIDTH = 100;
const TOTAL_WIDTH = WEEKDAYS.length * COLUMN_WIDTH;
const HOUR_HEIGHT = 30;
const MIN_HOUR = 6; // 6am
const MAX_HOUR = 17;  // 5pm
const TOTAL_HEIGHT = (MAX_HOUR - MIN_HOUR) * HOUR_HEIGHT;
const TIME_LABEL_OFFSET = 50;

const main = () => {
    const rootElement = document.getElementById("root");
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttributeNS(null, "viewBox", "-1 0 1000 1000");

    createCalendarGrid(svg);
    createClassRects(svg);
    root.appendChild(svg);
}

const createCalendarGrid = (svgElement) => {
  // Overall border rect
  const yOffset = 10;
  const outsideBorder = rect(
    TIME_LABEL_OFFSET,
    yOffset,
    TOTAL_WIDTH,
    TOTAL_HEIGHT,
    {
      fill: "none",
      stroke: "black",
    }
  );
  svgElement.appendChild(outsideBorder);

  // Column rects + labels
  WEEKDAYS.forEach((weekday, index) => {
    const colX = getWeekdayX(weekday);
    const columnRect = rect(
      colX,
      yOffset,
      COLUMN_WIDTH,
      TOTAL_HEIGHT,
      {
        fill: "none",
        stroke: "black",
      }
    );
    svgElement.appendChild(columnRect);

    const labelX = colX + COLUMN_WIDTH / 2;
    const labelText = weekday;
    const colLabel = text(labelX, yOffset + HOUR_HEIGHT/2, labelText);
    svgElement.appendChild(colLabel);
  });

  // Time lines + labels
  const numHours = (MAX_HOUR - MIN_HOUR);
  [...Array(numHours).keys()].forEach((i) => {
    const lineY = getTimeY(i + MIN_HOUR);//(i + 1) * HOUR_HEIGHT;
    const line = horizontalLine(
      TIME_LABEL_OFFSET,
      TIME_LABEL_OFFSET + TOTAL_WIDTH,
      lineY,
      {stroke: "grey"}
    );
    svgElement.appendChild(line);

    const labelName = (MIN_HOUR + i).toString();
    const label = text(0, lineY, labelName);
    svgElement.appendChild(label);
  });
};

const createClassRects = (svgElement) => {
  const classes = getData();
  classes.forEach((klass) => {
    const classDays = klass.days.split("");
    classDays.forEach((classDay) => {
      // Rectangle for class
      const classX = getWeekdayX(classDay);
      const classTop = getTimeY(parseTime(klass.startTime));
      const classBottom = getTimeY(parseTime(klass.endTime));
      const rectHeight = classBottom - classTop;
      const classRect = rect(
        classX,
        classTop,
        COLUMN_WIDTH,
        rectHeight,
        {
          fill: getColor(klass.department),
          "fill-opacity": "0.4",
          stroke: "black",
          "stroke-dasharray": "5,5"
        }
      );
      svgElement.append(classRect);

      // Label for class
      const classLabelText = `${klass.department} ${klass.classNumber}`;
      const classLabel = text(
        classX,
        classTop,
        classLabelText,
        {
          "font-size": "smaller",
        }
      )
      svgElement.append(classLabel);
    });
  });
}

const getWeekdayX = (weekday) => {
  const index = WEEKDAYS.indexOf(weekday);
  const weekdayX = TIME_LABEL_OFFSET + COLUMN_WIDTH * index;
  return weekdayX;
}

const getTimeY = (time) => {
  const timeY = (time - MIN_HOUR + 1) * HOUR_HEIGHT;
  return timeY;
}

const getColor = (department) => {
  switch (department) {
    case "BIOL":
      return "green";
    case "CHEM":
      return "blue";
  }
}

const parseTime = (timeString) => {
  const hour = timeString.substr(0, 2);
  const min = timeString.substr(2, 2);
  const time = Number(hour) + Number(min)/60;
  return time;
}

const text = (x, y, content, style) => {
  const textElem = getElement("text", {
    x: x,
    y: y,
    ...style
  });
  textElem.textContent = content;
  return textElem;
}

const horizontalLine = (x1, x2, y, style) => {
  return getElement("line", {
    x1: x1,
    x2: x2,
    y1: y,
    y2: y,
    ...style
  });
}

const rect = (x, y, w, h, style) => {
  return getElement("rect", {
    x: x,
    y: y,
    width: w,
    height: h,
    ...style
  });
};

const getElement = (name, properties) => {
    const element = document.createElementNS("http://www.w3.org/2000/svg", name)
    for (const prop in properties) {
        element.setAttributeNS(null, prop, properties[prop])
    }
    return element
}

const getData = () => {
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

# Classy

Hi Mom! :heart:

This is a tool to help you visualize courses and what rooms they're scheduled to occupy.

- [How to get the app](#how-to-get-the-app)
- [How to run the app](#how-to-run-the-app)
- [How to use the app](#how-to-use-the-app)

## How to get the app

1. Click the green "Code" button in the top right of this page.
1. Click "Download ZIP".
1. Unzip the .zip file that you downloaded into its own folder. The folder you unzipped to should now contain files such as `index.html` and `index.js`.
1. The app is now ready to use! See instructions below to run the app.

![how-to-download-app](./screencaps/how-to-download-app.png)

## How to run the app

Once you have downloaded and unzipped the app somewhere on your machine:

1. In your web browser, go to File > Open File and open `index.html` from the folder of unzipped files (see above).
1. You should see a page that looks something like the following screenshot.

![app-initial-ui](./screencaps/app-initial-ui.png)

## How to use the app

Once you have the app running in your browser:

1. Save a report from Excel in **UTF-8** `.csv` file format (not Mac or Windows CSV format).
1. You will see a button called "Browse...". Click the "Browse..." button and select the CSV you just saved in step 1.
1. You should now see a visualization of the schedule broken down by room, something like the screencaps below.
    1. **If you don't, call me and I'll fix it!**

### Notes on usage

- You can use Ctrl + P to print the page. Only the course schedule visualization should be printed.
- You can update the "Time interval" dropdown to change how much time each row represents.
- You can change the table to show columns by room number or by course number.
- You don't need to remove columns from the report before saving as a `.csv`.
- If you don't want to see a course, remove its row from your Excel sheet before saving as a `.csv`.
    - **The app will automatically ignore**:
        - Courses with status "Reserved".
        - Courses with no start time or end time.

## Screencaps

![schedule-visual-result](./screencaps/result.png)

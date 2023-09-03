# Classy

Hi Mom!

This is a tool to help you visualize class schedules.

## To Get the App

1. Click "Code" in the top right.
1. Click "Download ZIP".
1. Unzip the .zip file that you downloaded.
1. You can now open the `index.html` file in the folder you unzipped to use the app (see below).

## To Run the App

1. Save a report from Excel in `.csv` file format.
1. In your web browser, go to File > Open File and open `index.html` from the folder of unzipped files (see above).
1. You will see an interface to upload a file. Click "Browse..." and select the CSV you saved in step 1.
1. You should now see a visualization of the schedule broken down by room.

Notes:
- You don't need to remove columns from the report before saving as a `.csv`.
- If you don't want to see a course, remove its row from your Excel sheet before saving as a `.csv`.
    - The app will already filter out rooms that are not in building `HH`.
    - The app will already filter out courses with status "Reserved".
    - The app will already filter out courses with no start time, end time, or room number.
- Uploading a file will remove the "Browse..." interface. Reload the page (Ctrl + R) to load another file in.

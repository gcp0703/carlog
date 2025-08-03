# carlog

This project helps car owners maintain a database of their cars along with a comprehensive record of maintenance and repairs. it will prompt them for updates to maintenance and mileage through SMS on a schedule they define (weekly, monthly or quarterly). It will interpret responses like "oil change at [mileage] on [date]" or "23532" which would be a mileage update. 

Also on a user-defined timeframe (monthly, quarterly, annually) will send them notifications about maintenance for their car based on the year make options and model. the user can select between email, SMS or both for these notifications.

The backend will be written in Python with a Typescript front-end using a framework you will select.

The user interface must be secure and allow users to create accounts using their email as the user ID. the user-level information collected should include: email address, phone number, password.

On a separate page called "Cars" the user should be able to 1) add as many cars as they like, for each one selecting from a list of car brands, models, and years. for each car, zip code (for weather-related concerns), whether the car is garaged or not, and any other usage-related items that could affect maintenance of the car.

Use neo4j as the data store

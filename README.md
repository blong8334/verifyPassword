# Verify Password Project

## Background
- This node.js project verifies that a user's password meets certain requirements set by NIST.  The password
must be at least 8 characters and less than 65, it can only be made up of ASCII characters and it cannot be
considered a 'common password'. The list of common passwords can be provided by the user, otherwise a default list will
be used.  
- This project utilizes redis to store the list of common passwords.  Redis is a great fit for this application
as it is an in memory-cache allowing for quick verification that the password is/is not common.  The application has
several methods tht allow the user to load a custom list of common passwords.  All lists of common passwords are streamed
in and written in bulk to redis, therefore large file or list sizes are not an issue.  The common password list only needs
to be loaded when the program starts, therefore the write-intensive process is done only one time in an efficient manner.
- __All provided passwords must be in newline delimited format.__  

## How to run
1. Start redis.
    1. Navigate to the project's home directory.
    1. Run the following command: ``redis-4.0.10/src/redis-server``.
1. The redis server should now be running.
1. Start the application (Node.js must be installed.  If it is not see https://nodejs.org/en/download/).
    1. In a new shell, navigate to the projects home directory.
    1. Run the following command with any desired options (specified below): ``node index.js``.
1. The program will prompt the user to input a password.
1. User should input a password.
1. When the user hits enter, the program will check to see if the password is valid.

## Options
1. passwords
    1. A string of newline delimited common passwords.
    1. Example: ``node index.js --passwords "password1\npassword2\n"``
1. file
    1. A txt file containing a list of newline delimited passwords. The file can be provided
    with a relative or absolute path.  If no path is provided it will default to the current directory.
    1. Example: ``node index.js --file "./commonPasswords.txt"``
1. script
    1. A bash command to be executed that generates a common passwords list.
    1. Example: ``node index.js --script "cat testPasswords1.txt | testPasswords2.txt"``

## Notes
1. If any options values contain spaces they must be enclosed in double quotes ("VA LU ES").
1. Multiple options can be supplied.
    1. Example: ``node index.js --passwords "password1\npassword2\n" --file "./commonPasswords.txt" --script "cat testPasswords1.txt | testPasswords2.txt"``
    1. All passwords from the specified options will be loaded into redis.
    
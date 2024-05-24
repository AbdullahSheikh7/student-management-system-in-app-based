#!/usr/bin/env node

import chalk from "chalk";
import chalkAnimation from "chalk-animation";
import Table from "cli-table";
import figlet from "figlet";
import inquirer from "inquirer";
import gradientString from "gradient-string";
import { createSpinner } from "nanospinner";

let balance: number = 0;
let courses: string[] = [
  "English",
  "Physics",
  "Math",
  "Computer",
  "Urdu",
  "Islamiat",
  "Pakistan Studies",
];
let students: any = {};

// Student Class
class Student {
  name: string;
  class: number;
  rollNo: string;
  courses: string[];
  fees: number;
  feePaid: boolean;

  constructor(
    studentName: string,
    studentClass: number,
    studentRollNo: string,
    studentCourses: string[]
  ) {
    this.name = studentName;
    this.class = studentClass;
    this.rollNo = studentRollNo;
    this.courses = studentCourses;
    this.fees = this.courses.length * 100;
    this.feePaid = false;
  }
}

// Function for waiting the program default for 2 seconds
const sleep = async (ms: number = 2000) => {
  await new Promise((r) => {
    setTimeout(r, ms);
  });
};

const addStudent = async () => {
  let spinner = createSpinner("Please wait...");

  if (Object.keys(students).length >= 99999) {
    spinner.error({
      text: "The students has reached it's limit. Cannot add more students\n",
    });
    return;
  }

  let studentInfo = await inquirer.prompt([
    {
      name: "studentName",
      type: "input",
      message: "Student name:",
      validate(value) {
        if (/\W|\d/.test(value) || value == "") {
          return "Please provide a name";
        } else {
          return true;
        }
      },
    },
    {
      name: "studentClass",
      type: "input",
      message: "Student class:",
      validate(value) {
        if (/\D/.test(value) || value == "") {
          return "Please provide a class number";
        } else {
          return true;
        }
      },
    },
    {
      name: "studentRollNo",
      type: "input",
      message: "Student roll no:",
      validate(value) {
        if (/[\D]/.test(value)) {
          return "Please provide a roll no";
        } else {
          return true;
        }
      },
    },
    {
      name: "studentEnrolledCourses",
      type: "checkbox",
      message: "Student enrolled courses:",
      choices: courses,
    },
    {
      name: "confirmAddingStudent",
      type: "confirm",
      message: "Confirm adding student?",
    },
  ]);

  spinner.start();
  await sleep();

  if (studentInfo.confirmAddingStudent) {
    let studentsIds = Object.keys(students);
    let uniqueRandomId: string;
    do {
      uniqueRandomId = Math.floor(Math.random() * 99999)
        .toString()
        .padStart(5, "0");
    } while (studentsIds.includes(uniqueRandomId));

    let student = new Student(
      studentInfo.studentName,
      parseInt(studentInfo.studentClass),
      studentInfo.studentRollNo,
      studentInfo.studentEnrolledCourses
    );

    students[uniqueRandomId] = {
      name: student.name,
      class: student.class,
      rollNo: student.rollNo,
      courses: student.courses,
      fees: student.fees,
      feePaid: student.feePaid,
    };

    spinner.success({ text: "Student added successfully\n" });
  } else {
    spinner.error({ text: "Student not added\n" });
  }
};

const enrollStudent = async () => {
  let spinner = createSpinner("Please wait...");

  let studentsNames = Object.keys(students).map((e) => students[e].name);

  if (Object.keys(students).length == 0) {
    spinner.error({ text: "No students found\n" });
    return;
  }

  let notEnrolledCourse: string[];

  studentsNames.push("Exit");
  let student = await inquirer.prompt({
    name: "student",
    type: "list",
    message: "Select a student to enroll:",
    choices: studentsNames,
  });

  if (student.student == "Exit") {
    return;
  }

  notEnrolledCourse = courses.filter(
    (e) =>
      !students[
        Object.keys(students)[studentsNames.indexOf(student.student)]
      ].courses.includes(e)
  );

  if (notEnrolledCourse.length == 0) {
    spinner.error({ text: "No courses left to enroll to\n" });
    return;
  }

  let course = await inquirer.prompt([
    {
      name: "courses",
      type: "checkbox",
      message: "Select a course to enroll student to:",
      choices: notEnrolledCourse,
    },
    {
      name: "confirmEnrollingStudent",
      type: "confirm",
      message: "Confirm enrolling student?",
    },
  ]);

  spinner.start();
  await sleep();

  if (course.confirmEnrollingStudent) {
    students[
      Object.keys(students)[studentsNames.indexOf(student.student)]
    ].courses = students[
      Object.keys(students)[studentsNames.indexOf(student.student)]
    ].courses.concat(course.courses);

    students[
      Object.keys(students)[studentsNames.indexOf(student.student)]
    ].fees =
      students[Object.keys(students)[studentsNames.indexOf(student.student)]]
        .courses.length * 100;

    students[
      Object.keys(students)[studentsNames.indexOf(student.student)]
    ].feePaid = false;

    spinner.success({
      text: `${student.student} enrolled to ${course.courses.join(
        " and "
      )} course successfully\n`,
    });
  } else {
    spinner.error({
      text: `${student.student} not enrolled to any other course\n`,
    });
  }
};

const payTuitionFees = async () => {
  let spinner = createSpinner("Please wait...");

  if (Object.keys(students).length == 0) {
    spinner.error({ text: "No students found\n" });
    return;
  }

  let feePaidFalseStudentsIds: string[] = Object.keys(students).filter(
    (e) => !students[e].feePaid
  );
  let feePaidFalseStudentsNames = feePaidFalseStudentsIds.map(
    (e) => students[e].name
  );
  let studentsNames = Object.keys(students).map((e) => students[e].name);

  if (Object.keys(students).length == 0) {
    spinner.error({text : "No students found\n"});
    return balance;
  }
  
  if (feePaidFalseStudentsNames.length == 0) {
    spinner.error({text : "All students fees are paid\n"});
    return balance;
  }

  feePaidFalseStudentsNames.push("Exit");

  let payFeesStudent = await inquirer.prompt({
    name: "student",
    type: "list",
    message: "Choose a student to pay fees:",
    choices: feePaidFalseStudentsNames,
  });

  if (payFeesStudent.student == "Exit") {
    console.log();
    return balance;
  }

  spinner.start();

  await sleep();

  students[
    Object.keys(students)[studentsNames.indexOf(payFeesStudent.student)]
  ].feePaid = true;

  balance +=
    students[
      Object.keys(students)[studentsNames.indexOf(payFeesStudent.student)]
    ].fees;

  spinner.success({
    text: `${payFeesStudent.student} fees paid successfully\n`,
  });
};

const showStatus = async () => {
  let spinner = createSpinner("Please wait...");
  let studentsIds = Object.keys(students);

  if (studentsIds.length == 0) {
    spinner.error({ text: "No students found\n" });
    return;
  }

  const studentsTable = new Table({
    head: [
      chalk.yellow.bold("Id"),
      chalk.white.bold("Name"),
      chalk.white.bold("Class"),
      chalk.white.bold("Roll no"),
      chalk.white.bold("Courses Enrolled"),
      chalk.white.bold("Fees"),
      chalk.white.bold("Fees status"),
    ],
  });

  for (let i = 0; i < studentsIds.length; i++) {
    studentsTable.push([
      chalk.yellow(studentsIds[i]),
      students[studentsIds[i]].name,
      students[studentsIds[i]].class,
      students[studentsIds[i]].rollNo,
      students[studentsIds[i]].courses.join(", "),
      students[studentsIds[i]].fees,
      students[studentsIds[i]].feePaid
        ? chalk.green("Paid")
        : chalk.red("Not paid"),
    ]);
  }

  spinner.start();
  await sleep();
  spinner.success({ text: "Students status" });

  console.log(`${studentsTable.toString()}\n`);
};

figlet("Students Management System", (error, data) => {
  console.log(gradientString.pastel.multiline(data));
});

const main = async () => {
  let exit: boolean = false;

  // Project and Developer Introduction
  await sleep(1000);

  let developer = chalkAnimation.rainbow("Made by Abdullah");
  await sleep(1000);
  developer.stop();

  let github = chalkAnimation.neon("github.com/abdullahsheikh7/\n");
  await sleep(1000);
  github.stop();

  do {
    let option = (
      await inquirer.prompt({
        name: "option",
        type: "list",
        message: "Please select an option:",
        choices: [
          "Add student",
          "Enroll student",
          "View balance",
          "Pay tuition fees",
          "Show status",
          "Exit",
        ],
      })
    ).option;

    if (option == "Add student") {
      await addStudent();
    } else if (option == "Enroll student") {
      await enrollStudent();
    } else if (option == "View balance") {
      let spinner = createSpinner("Please wait...");
      spinner.start();
      await sleep();
      spinner.success({ text: `Your balance is $${balance}\n` });
    } else if (option == "Pay tuition fees") {
      await payTuitionFees();
    } else if (option == "Show status") {
      await showStatus();
    } else if (option == "Exit") {
      (
        await inquirer.prompt({
          name: "exit",
          type: "confirm",
          message: "Confirm exit?",
        })
      ).exit
        ? (exit = true)
        : console.log();
    }
  } while (!exit);
};

main();

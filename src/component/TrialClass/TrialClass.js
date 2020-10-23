import React, { useEffect, useState, useRef } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import moment from "moment";
import "bootstrap/dist/css/bootstrap.min.css";
import { NotificationManager } from "react-notifications";
import "react-notifications/lib/notifications.css";

const TrialClass = () => {
  const [courseData, setCourseData] = useState(null);
  const [courseName, setCourseName] = useState(null);
  const [errors, setErrors] = useState({});
  const [dateSelect, setDateSelect] = useState(null);
  const [validated, setValidated] = useState(false);
  const formRef = useRef(null);
  const [showError, setShowError] = useState();

  useEffect(() => {
    axios
      .get(
        "https://script.google.com/macros/s/AKfycbzJ8Nn2ytbGO8QOkGU1kfU9q50RjDHje4Ysphyesyh-osS76wep/exec"
      )
      .then((resp) => {
        let newResponse = resp.data;
        newResponse.forEach((course) =>
          course.slots.forEach(
            (slot) => (slot["time"] = moment(parseInt(slot.slot)))
          )
        );
        setCourseData(newResponse);
      })
      .catch((error) => {
        NotificationManager.error("unable to get the data", "", 2000);
      });
  }, []);

  const submitForm = (e) => {
    e.preventDefault();
    let data = {
      parentName: e.target[0].value,
      parentPhone: e.target[1].value,
      parentEmail: e.target[2].value,
      childName: e.target[3].value,
      childAge: e.target[4].value,
      courseName: e.target[5].value,
      date: e.target[6].value,
      time: e.target[7].value,
    };
    let newErrors = { ...errors };

    if (!/^\d{10}$/.test(data.parentPhone)) {
      newErrors["phoneNumber"] = "Invaid Phone Number";
    } else {
      delete newErrors["phoneNumber"];
    }
    if (
      !/^([a-z0-9_\-\.])+\@([a-z0-9_\-])+\.([a-z]{2,})$/.test(data.parentEmail)
    ) {
      newErrors["email"] = "Invalid Email Address";
    } else {
      delete newErrors["email"];
    }
    setErrors(newErrors);
    if (!Object.keys(newErrors).length) {
      axios
        .post("http://localhost:2000/bookSession", data)
        .then((response) => {
          NotificationManager.success(response.data.message, "", 2000);
          setValidated(true);
          formRef.current.reset();
          setValidated(false);
        })
        .catch((error) => {
          setShowError(error.response.data.message);
        });
    }
  };
  return (
    <>
      {courseData ? (
        <>
          {showError && (
            <div class="alert alert-danger" role="alert">
              {showError}
            </div>
          )}
          <Form onSubmit={submitForm} ref={formRef} validated={validated}>
            <Form.Group controlId="pname">
              <Form.Label>Parent's Name</Form.Label>
              <Form.Control type="text" placeholder="Enter parent name" />
            </Form.Group>
            <Form.Group controlId="pnumber">
              <Form.Label>Parent's Contact Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter parent Contact number"
              />{" "}
              {errors.hasOwnProperty("phoneNumber") && (
                <p style={{ color: "red" }}>{errors.phoneNumber}</p>
              )}
            </Form.Group>

            <Form.Group controlId="pemail">
              <Form.Label>Parent's Email ID</Form.Label>
              <Form.Control type="email" placeholder="Enter parent email" />
              {errors.hasOwnProperty("email") && (
                <p style={{ color: "red" }}>{errors.email}</p>
              )}
            </Form.Group>
            <Form.Group controlId="cname">
              <Form.Label>Child's Name</Form.Label>
              <Form.Control type="text" placeholder="Enter child name" />
            </Form.Group>
            <Form.Group controlId="cage">
              <Form.Label>Child's Age</Form.Label>
              <Form.Control type="number" placeholder="Enter child age" />
            </Form.Group>
            <Form.Group controlId="coursename">
              <Form.Label>Course Name</Form.Label>
              <Form.Control
                as="select"
                type="text"
                onChange={(e) => {
                  let data = e.target.value;
                  setCourseName(data);
                }}
              >
                <option value="">Select the course</option>
                {courseData.map((course) => {
                  return (
                    <option value={course.course_name}>
                      {course.course_name}
                    </option>
                  );
                })}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="classdate">
              <Form.Label>Suitable Date for a trial class</Form.Label>
              <Form.Control
                type="date"
                min={moment(new Date()).format("YYYY-MM-DD ")}
                max={moment(
                  new Date().setDate(new Date().getDate() + 7)
                ).format("YYYY-MM-DD")}
                onChange={(e) => {
                  let date = e.target.value;
                  setDateSelect(moment(date));
                }}
                onKeyDown={(e) => e.preventDefault()}
              />
            </Form.Group>
            <Form.Group controlId="timeslot">
              <Form.Label>Suitable Time Slot for the trial class</Form.Label>
              <Form.Control
                as="select"
                type="time"
                placeholder="Enter the time slot"
              >
                <option value="">Select the time slot</option>
                {courseName &&
                  dateSelect &&
                  courseData
                    .filter((course) => course.course_name === courseName)[0]
                    .slots.filter((slot) => {
                      if (slot.time.date() === dateSelect.date()) {
                        let slot_time = slot.time;
                        let finalTime = slot_time.diff(moment(), "hours");
                        if (finalTime >= 4) {
                          return true;
                        } else {
                          return false;
                        }
                      } else {
                        return false;
                      }
                    })
                    .map((timeSlot) => {
                      let slot_time = moment(timeSlot.time);
                      return (
                        <option value={timeSlot.slot}>
                          {timeSlot.time.format("LT")} --{" "}
                          {slot_time.add("1", "hours").format("LT")}
                        </option>
                      );
                    })}
              </Form.Control>
            </Form.Group>
            <Button variant="primary" type="submit" style={{ width: "100%" }}>
              Submit
            </Button>
          </Form>
        </>
      ) : (
        <h1>Loading....</h1>
      )}
    </>
  );
};

export default TrialClass;

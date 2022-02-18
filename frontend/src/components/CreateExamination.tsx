import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  makeStyles,
  Theme,
  createStyles,
} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import Snackbar from "@material-ui/core/Snackbar";
import Select from "@material-ui/core/Select";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";
import TextField from '@material-ui/core/TextField';

import { EmployeeInterface } from "../models/IEmployee";
import { PatientInterface } from "../models/IPatient";
import { ClinicInterface } from "../models/IClinic";
import { DiseaseInterface } from "../models/IDisease";
import { MedicineInterface } from "../models/IMedicine";
import { ExaminationInterface } from "../models/IExamination";
import HomeIcon from "@material-ui/icons/Home";
import Link from "@material-ui/core/Link";

import {
  MuiPickersUtilsProvider,
  KeyboardDateTimePicker,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";

const Alert = (props: AlertProps) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    container: {
      marginTop: theme.spacing(2),
    },
    paper: {
      padding: theme.spacing(2),
      color: theme.palette.text.secondary,
    },
  })
);

function CreateExamination() {
  const classes = useStyles();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [employees, setEmployees] = useState<EmployeeInterface>();
  const [patients, setPatiens] = useState<PatientInterface[]>([]);
  const [clinics, setClinics] = useState<ClinicInterface[]>([]);
  const [diseases, setDiseases] = useState<DiseaseInterface[]>([]);
  const [medicines, setMedicines] = useState<MedicineInterface[]>([]);
  const [examination, setExamination] = useState<Partial<ExaminationInterface>>({});

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userError, setUserError] = useState(false);

  const signout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const apiUrl = "http://localhost:8080";
  const requestOptions = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
  };

  const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setSuccess(false);
    setError(false);
    setUserError(false);
  };

  const handleChange = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const name = event.target.name as keyof typeof examination;
    setExamination({
      ...examination,
      [name]: event.target.value,
    });
  };

  const handleInputChange = (
    event: React.ChangeEvent<{ id?: string; value: any }>
  ) => {
    const id = event.target.id as keyof typeof examination;
    const { value } = event.target;
    setExamination({ ...examination, [id]: value });
  };

  const handleDateChange = (date: Date | null) => {
    console.log(date);
    setSelectedDate(date);
  };

  const getEmployees = async () => {
    let uid = localStorage.getItem("uid");
    fetch(`${apiUrl}/employee/${uid}`, requestOptions)
      .then((response) => response.json())
      .then((res) => {
        examination.EmployeeID = res.data.ID
        if (res.data) {
          setEmployees(res.data);
        } else {
          console.log("else");
        }
      });
  };

  const getPatiens = async () => {
    fetch(`${apiUrl}/patients`, requestOptions)
      .then((response) => response.json())
      .then((res) => {
        if (res.data) {
          setPatiens(res.data);
        } else {
          console.log("else");
        }
      });
  };

  const getClinics = async () => {
    fetch(`${apiUrl}/clinics`, requestOptions)
      .then((response) => response.json())
      .then((res) => {
        console.log("RES" , res)
        if (res.data) {
          setClinics(res.data);
        } else {
          console.log("else");
        }
      });
  };

  const getDiseases = async () => {
    fetch(`${apiUrl}/diseases`, requestOptions)
      .then((response) => response.json())
      .then((res) => {
        console.log("RES" , res)
        if (res.data) {
          setDiseases(res.data);
        } else {
          console.log("else");
        }
      });
  };

  const getMedicines = async () => {
    fetch(`${apiUrl}/medicines`, requestOptions)
      .then((response) => response.json())
      .then((res) => {
        if (res.data) {
          setMedicines(res.data);
        } else {
          console.log("else");
        }
      });
  };

  useEffect(() => {
    getEmployees();
    getPatiens();
    getClinics();
    getDiseases();
    getMedicines();
  }, []);

  const convertType = (data: string | number | undefined) => {
    let val = typeof data === "string" ? parseInt(data) : data;
    return val;
  };

  function submit() {

    let data = {
      EmployeeID: convertType(examination.EmployeeID),
      PatientID: convertType(examination.PatientID),
      ClinicID: convertType(examination.ClinicID),
      DiseaseID: convertType(examination.DiseaseID),
      MedicineID: convertType(examination.MedicineID),
      ChiefComplaint: examination.ChiefComplaint,
      Treatment: examination.Treatment,
      Cost: convertType(examination.Cost),
      DiagnosisTime: selectedDate,
    };

    const requestOptionsPost = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    fetch(`${apiUrl}/examinations`, requestOptionsPost)
      .then((response) => response.json())
      .then((res) => {
        console.log("RES" , res)
        if (res.data) {
          setSuccess(true);
          setErrorMessage("")
          ClearForm();
        }
        else if (res.error == "The data recorder should be a Doctor !!") {
          setUserError(true);
        }
        else {
          setError(true);
          if (res.error.includes("patient not found")) {
            setErrorMessage("กรุณาเลือกชื่อ-นามสกุลผู้ป่วย")
          }
          else if (res.error.includes("clinic not found")) {
            setErrorMessage("กรุณาเลือกคลินิก")
          }
          else if (res.error.includes("disease not found")) {
            setErrorMessage("กรุณาเลือกโรคจากการวินิจฉัย")
          }
          else if (res.error.includes("Treatment Not Blank")) {
            setErrorMessage("วิธีการรักษาไม่สามารถเป็นค่าว่างได้")
          }
          else if (res.error.includes("Cost cannot less than zero")) {
            setErrorMessage("ราคาการรักษาไม่สามารถเป็นค่าคิดลบได้")
            ClearCost();
          }
          else if (res.error.includes("medicine not found")) {
            setErrorMessage("กรุณาเลือกยาที่ต้องจ่าย")
          }
          else if (res.error.includes("DiagnosisTime must not be past")) {
            setErrorMessage("เลือกวันที่และเวลาปัจจุบัน")
            setSelectedDate(new Date());
          }
          else {
            setErrorMessage(res.error);
          }
        }
      });
  }

  function ClearForm() {
    setExamination({
      ChiefComplaint: "",
      Treatment: "",
      Cost: 0,
      DiagnosisTime: new Date(),
      EmployeeID: examination.EmployeeID,
      PatientID: 0,
      ClinicID: 0,
      DiseaseID: 0,
      MedicineID: 0,
    });
  }

  function ClearCost() {
    setExamination({
      ChiefComplaint: examination.ChiefComplaint,
      Treatment: examination.Treatment,
      Cost: 0,
      DiagnosisTime: examination.DiagnosisTime,
      EmployeeID: examination.EmployeeID,
      PatientID: examination.PatientID,
      ClinicID: examination.ClinicID,
      DiseaseID: examination.DiseaseID,
      MedicineID: examination.MedicineID,
    });
  }

  return (
    <Container className={classes.container} maxWidth="md">
      <Snackbar open={success} autoHideDuration={3000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success">
          บันทึกข้อมูลสำเร็จ
        </Alert>
      </Snackbar>
      <Snackbar open={error} autoHideDuration={3000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error">
          บันทึกข้อมูลไม่สำเร็จ: {errorMessage}
        </Alert>
      </Snackbar>
      <Snackbar open={userError} autoHideDuration={3000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error">
          บันทึกข้อมูลไม่สำเร็จ: ผู้บันทึกข้อมูลต้องเป็นแพทย์
          <p></p>
          <strong>
            <Link onClick={signout} style={{ color: "#fff" } }>
              ออกจากระบบ
            </Link>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <Link href="/" style={{ color: "#fff" }}>
              กลับหน้าหลัก
            </Link>
          </strong>
        </Alert>
      </Snackbar>
      <Paper className={classes.paper}>
        <Box display="flex">
          <Box flexGrow={1}>
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              ผลการตรวจรักษา
            </Typography>
          </Box>
          <Box>
            <Button
              component={RouterLink}
              to="/"
              variant="contained"
              size="small"
              startIcon={<HomeIcon/>}
              color="primary"
            >
              หน้าแรก
            </Button>
          </Box>
        </Box>
        <Divider />
        <Grid container spacing={0} className={classes.root}>
          <Grid item xs={6}>
            <FormControl fullWidth variant="outlined">
              <p style={{color:"#135B1A",fontSize: "10"}}>ชื่อ-นามสกุลผู้ป่วย</p>
              <Select
                native
                value={examination.PatientID}
                onChange={handleChange}
                inputProps={{
                  name: "PatientID",
                }}
              >
                <option aria-label="None" value="">
                  กรุณาเลือกชื่อ-นามสกุลของผู้ป่วย
                </option>
                {patients.map((item: PatientInterface) => (
                  <option value={item.ID} key={item.ID}>
                    {[item.FirstName, " ", item.LastName]}
                  </option>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth variant="outlined">
              <p style={{color:"#135B1A",fontSize: "10"}}>แพทย์ผู้วินิจฉัย</p>
              <Select
                native
                disabled
                value={examination.EmployeeID}
                onChange={handleChange}
                inputProps={{
                  name: "EmployeeID",
                }}
                >
                  <option value={employees?.ID} key={employees?.ID}>
                    {employees?.Name}
                 </option>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth variant="outlined">
              <p style={{color:"#135B1A",fontSize: "10"}}>คลิกนิก</p>
              <Select
                native
                value={examination.ClinicID}
                onChange={handleChange}
                inputProps={{
                  name: "ClinicID",
                }}
              >
                <option aria-label="None" value="">
                  กรุณาเลือกคลิกนิก
                </option>
                {clinics.map((item: ClinicInterface) => (
                  <option value={item.ID} key={item.ID}>
                    {item.ClinicName}
                  </option>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
          </Grid>
          <Grid item xs={6}>
            <p style={{color:"#135B1A",fontSize: "10"}}>อาการสำคัญผู้ป่วย</p>
            <FormControl fullWidth variant="outlined">
              <TextField
                id="ChiefComplaint"
                variant="outlined"
                type="string"
                size="medium"
                placeholder="กรุณากรอกอาการสำคัญ"
                value={examination.ChiefComplaint || ""}
                onChange={handleInputChange}
              />
            </FormControl>
          </Grid>
          <Grid item xs={6}>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth variant="outlined">
              <p style={{color:"#135B1A",fontSize: "10"}}>โรคจากการวินิจฉัย</p>
              <Select
                native
                value={examination.DiseaseID}
                onChange={handleChange}
                inputProps={{
                  name: "DiseaseID",
                }}
              >
                <option aria-label="None" value="">
                  กรุณาเลือกโรค
                </option>
                {diseases.map((item: DiseaseInterface) => (
                  <option value={item.ID} key={item.ID}>
                    {item.Name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
          </Grid>
          <Grid item xs={5}>
            <p style={{color:"#135B1A",fontSize: "10"}}>วิธีการรักษา</p>
            <FormControl fullWidth variant="outlined">
              <TextField
                id="Treatment"
                variant="outlined"
                type="string"
                size="medium"
                placeholder="กรุณากรอกวิธีการรักษา"
                value={examination.Treatment || ""}
                onChange={handleInputChange}
              />
            </FormControl>
          </Grid>
          <Grid item xs={2}>
          </Grid>
          <Grid item xs={5}>
            <p style={{color:"#135B1A",fontSize: "10"}}>ราคาการรักษา</p>
            <FormControl fullWidth variant="outlined">
              <TextField
                id="Cost"
                variant="outlined"
                type="number"
                size="medium"
                placeholder="กรุณากรอกราคาการรักษา"
                value={examination.Cost}
                onChange={handleInputChange}
              />
            </FormControl>
          </Grid>
          <Grid item xs={5}>
            <FormControl fullWidth variant="outlined">
              <p style={{color:"#135B1A",fontSize: "10"}}>ยาที่ต้องจ่าย</p>
              <Select
                native
                value={examination.MedicineID}
                onChange={handleChange}
                inputProps={{
                  name: "MedicineID",
                }}
              >
                <option aria-label="None" value="">
                  กรุณาเลือกยาที่ต้องจ่าย
                </option>
                {medicines.map((item: MedicineInterface) => (
                  <option value={item.ID} key={item.ID}>
                    {item.Name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth variant="outlined">
              <p style={{color:"#135B1A",fontSize: "10"}}>วันเวลาที่ทำการวินิจฉัย</p>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDateTimePicker
                  name="DiagnosisTime"
                  value={selectedDate}
                  onChange={handleDateChange}
                  label="กรุณาเลือกวันเวลาที่ทำการวินิจฉัย"
                  format="yyyy/MM/dd hh:mm a"
                />
              </MuiPickersUtilsProvider>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
          <p></p>
            <Button
              component={RouterLink}
              to="/Examination"
              variant="contained"
            >
              กลับ
            </Button>
            <Button
              style={{ float: "right" }}
              variant="contained"
              onClick={submit}
              color="primary"
            >
              บันทึกผลวินิจฉัย
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default CreateExamination;
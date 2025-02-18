// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract DoctorContract {
    // Doctor Structure
    struct Doctor {
        address doctorAddress;
        string name;
        string specialization;
        uint256 consultationFee;
        bool isVerified;
        uint256 totalAppointments;
    }

    // Appointment Structure
    struct Appointment {
        uint256 id;
        address patient;
        address doctor;
        uint256 timestamp;
        bool isBooked;
        bool isCompleted;
    }

    // Mappings
    mapping(address => Doctor) public doctors;
    mapping(uint256 => Appointment) public appointments;
    uint256 public appointmentCounter;

    // Events
    event DoctorRegistered(address indexed doctor, string name, string specialization);
    event AppointmentCreated(uint256 indexed appointmentId, address patient, address doctor);
    event AppointmentCompleted(uint256 indexed appointmentId);

    // Modifiers
    modifier onlyDoctor() {
        require(doctors[msg.sender].isVerified, "Not a verified doctor");
        _;
    }

    // Doctor Registration
    function registerDoctor(
        string memory _name, 
        string memory _specialization, 
        uint256 _consultationFee
    ) public {
        require(!doctors[msg.sender].isVerified, "Doctor already registered");
        
        doctors[msg.sender] = Doctor({
            doctorAddress: msg.sender,
            name: _name,
            specialization: _specialization,
            consultationFee: _consultationFee,
            isVerified: true,
            totalAppointments: 0
        });

        emit DoctorRegistered(msg.sender, _name, _specialization);
    }

    // Create Appointment (called by patient contract)
    function createAppointment(
        address _patient, 
        address _doctor, 
        uint256 _timestamp
    ) external {
        uint256 appointmentId = appointmentCounter++;
        
        appointments[appointmentId] = Appointment({
            id: appointmentId,
            patient: _patient,
            doctor: _doctor,
            timestamp: _timestamp,
            isBooked: true,
            isCompleted: false
        });

        doctors[_doctor].totalAppointments++;
        
        emit AppointmentCreated(appointmentId, _patient, _doctor);
    }

    // Complete Appointment
    function completeAppointment(uint256 _appointmentId) public onlyDoctor {
        Appointment storage appointment = appointments[_appointmentId];
        require(appointment.doctor == msg.sender, "Not your appointment");
        require(appointment.isBooked, "Appointment not booked");
        
        appointment.isCompleted = true;

        emit AppointmentCompleted(_appointmentId);
    }

    // Utility Functions
    function isDoctorVerified(address _doctor) public view returns (bool) {
        return doctors[_doctor].isVerified;
    }

    function getConsultationFee(address _doctor) public view returns (uint256) {
        return doctors[_doctor].consultationFee;
    }

    function getDoctorDetails(address _doctor) public view returns (Doctor memory) {
        return doctors[_doctor];
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DoctorAppointment {
    address public owner;
    uint256 public commissionPercentage = 10; 

    struct Appointment {
        address patient;
        address doctor;
        uint256 amountPaid;
        uint256 bookingTime;
        bool isActive;
    }

    mapping(uint256 => Appointment) public appointments;
    uint256 public appointmentCounter;

    event AppointmentBooked(
        uint256 appointmentId,
        address indexed patient,
        address indexed doctor,
        uint256 amountPaid,
        uint256 bookingTime
    );

    event AppointmentCancelled(uint256 appointmentId, address indexed patient);
    event CommissionWithdrawn(address indexed owner, uint256 amount);

    constructor() {
        owner = msg.sender; // Contract deployer is the owner
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    function bookAppointment(address _doctor) external payable {
        require(msg.value > 0, "Payment required");

        uint256 commission = (msg.value * commissionPercentage) / 100;
        uint256 doctorPayment = msg.value - commission;

        // Transfer doctor's share
        payable(_doctor).transfer(doctorPayment);

        // Store appointment details
        appointmentCounter++;
        appointments[appointmentCounter] = Appointment(
            msg.sender,
            _doctor,
            msg.value,
            block.timestamp,
            true
        );

        emit AppointmentBooked(appointmentCounter, msg.sender, _doctor, msg.value, block.timestamp);
    }

    function checkAppointmentValidity(uint256 _appointmentId) public view returns (bool) {
        Appointment memory app = appointments[_appointmentId];
        require(app.isActive, "Appointment does not exist or is cancelled");

        uint256 expiryTime = app.bookingTime + 3 days;
        return block.timestamp <= expiryTime;
    }

    function cancelAppointment(uint256 _appointmentId) external {
        Appointment storage app = appointments[_appointmentId];
        require(msg.sender == app.patient, "Not your appointment");
        require(app.isActive, "Already cancelled");

        app.isActive = false;
        emit AppointmentCancelled(_appointmentId, msg.sender);
    }

    function withdrawCommission() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds available");
        payable(owner).transfer(balance);
        emit CommissionWithdrawn(owner, balance);
    }

    function getAppointmentDetails(uint256 _appointmentId) external view returns (
        address patient,
        address doctor,
        uint256 amountPaid,
        uint256 bookingTime,
        bool isActive
    ) {
        Appointment memory app = appointments[_appointmentId];
        return (app.patient, app.doctor, app.amountPaid, app.bookingTime, app.isActive);
    }
}

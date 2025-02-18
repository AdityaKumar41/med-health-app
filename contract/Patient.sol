// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./Doctor.sol";
import "./Supplier.sol";

contract PatientContract {
    // Patient Structure


    struct Patient {
        address patientAddress;
        string name;
        string email;
        uint256 age;
        bool isRegistered;
        uint256 totalAppointments;
        uint256 totalPurchases;
    }

    // Medical Record Structure
    struct MedicalRecord {
        uint256 id;
        address patient;
        string diagnosis;
        string prescription;
        uint256 timestamp;
        address doctorAddress;
    }

    // Mappings
    mapping(address => Patient) public patients;
    mapping(address => MedicalRecord[]) public patientRecords;
    
    // Contracts
    DoctorContract public doctorContract;
    SupplierContract public supplierContract;

    // Events
    event PatientRegistered(address indexed patient, string name);
    event AppointmentBooked(address indexed patient, address indexed doctor, uint256 timestamp);
    event MedicalRecordAdded(address indexed patient, uint256 recordId);
    event MedicinePurchased(address indexed patient, uint256 medicineId, uint256 quantity);

    // Modifiers
    modifier onlyPatient() {
        require(patients[msg.sender].isRegistered, "Not a registered patient");
        _;
    }

    constructor(address _doctorContractAddress, address _supplierContractAddress) {
        doctorContract = DoctorContract(_doctorContractAddress);
        supplierContract = SupplierContract(_supplierContractAddress);
    }

    // Patient Registration
    function registerPatient(
        string memory _name, 
        string memory _email, 
        uint256 _age
    ) public {
        require(!patients[msg.sender].isRegistered, "Patient already registered");
        
        patients[msg.sender] = Patient({
            patientAddress: msg.sender,
            name: _name,
            email: _email,
            age: _age,
            isRegistered: true,
            totalAppointments: 0,
            totalPurchases: 0
        });

        emit PatientRegistered(msg.sender, _name);
    }

    // Book Appointment
    function bookAppointment(
        address _doctorAddress, 
        uint256 _timestamp
    ) public onlyPatient payable {
        // Verify doctor exists and is verified
        require(doctorContract.isDoctorVerified(_doctorAddress), "Invalid doctor");
        
        // Get consultation fee from doctor contract
        uint256 consultationFee = doctorContract.getConsultationFee(_doctorAddress);
        require(msg.value >= consultationFee, "Insufficient consultation fee");

        // Book appointment through doctor contract
        doctorContract.createAppointment(msg.sender, _doctorAddress, _timestamp);

        // Update patient appointments
        patients[msg.sender].totalAppointments++;

        emit AppointmentBooked(msg.sender, _doctorAddress, _timestamp);
    }

    // Purchase Medicine
    function purchaseMedicine(
        uint256 _medicineId, 
        uint256 _quantity
    ) public onlyPatient payable {
        // Verify medicine availability and get details
        (address supplier, uint256 price, uint256 availableQuantity) = supplierContract.getMedicineDetails(_medicineId);
        require(_quantity <= availableQuantity, "Insufficient medicine quantity");
        require(msg.value >= price * _quantity, "Insufficient payment");

        // Process purchase through supplier contract
        supplierContract.processMedicineSale(_medicineId, _quantity, msg.sender);

        // Update patient purchases
        patients[msg.sender].totalPurchases++;

        emit MedicinePurchased(msg.sender, _medicineId, _quantity);
    }

    // Add Medical Record (only doctors can call this)
    function addMedicalRecord(
        address _patient, 
        string memory _diagnosis, 
        string memory _prescription
    ) public {
        require(doctorContract.isDoctorVerified(msg.sender), "Only verified doctors can add records");

        uint256 recordId = patientRecords[_patient].length;
        patientRecords[_patient].push(MedicalRecord({
            id: recordId,
            patient: _patient,
            diagnosis: _diagnosis,
            prescription: _prescription,
            timestamp: block.timestamp,
            doctorAddress: msg.sender
        }));

        emit MedicalRecordAdded(_patient, recordId);
    }

    // View Patient Medical Records
    function getPatientMedicalRecords(address _patient) public view returns (MedicalRecord[] memory) {
        return patientRecords[_patient];
    }

    // Patient Details Retrieval
    function getPatientDetails(address _patient) public view returns (Patient memory) {
        return patients[_patient];
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract SupplierContract {
    // Supplier Structure
    struct Supplier {
        address supplierAddress;
        string name;
        string contactInfo;
        bool isVerified;
        uint256 totalMedicinesListed;
    }

    // Medicine Structure
    struct Medicine {
        uint256 id;
        string name;
        string category;
        uint256 price;
        uint256 quantity;
        address supplier;
        bool isActive;
    }

    // Sales Transaction Structure
    struct SalesTransaction {
        uint256 medicineId;
        address patient;
        uint256 quantity;
        uint256 timestamp;
    }

    // Mappings
    mapping(address => Supplier) public suppliers;
    mapping(uint256 => Medicine) public medicines;
    mapping(address => SalesTransaction[]) public salesHistory;
    
    uint256 public medicineCounter;

    // Events
    event SupplierRegistered(address indexed supplier, string name);
    event MedicineAdded(uint256 indexed medicineId, string name, uint256 price, uint256 quantity);
    event MedicineSold(uint256 indexed medicineId, address indexed patient, uint256 quantity);

    // Modifiers
    modifier onlySupplier() {
        require(suppliers[msg.sender].isVerified, "Not a verified supplier");
        _;
    }

    // Supplier Registration
    function registerSupplier(
        string memory _name, 
        string memory _contactInfo
    ) public {
        require(!suppliers[msg.sender].isVerified, "Supplier already registered");
        
        suppliers[msg.sender] = Supplier({
            supplierAddress: msg.sender,
            name: _name,
            contactInfo: _contactInfo,
            isVerified: true,
            totalMedicinesListed: 0
        });

        emit SupplierRegistered(msg.sender, _name);
    }

    // Add Medicine
    function addMedicine(
        string memory _name, 
        string memory _category, 
        uint256 _price, 
        uint256 _quantity
    ) public onlySupplier {
        uint256 medicineId = medicineCounter++;
        
        medicines[medicineId] = Medicine({
            id: medicineId,
            name: _name,
            category: _category,
            price: _price,
            quantity: _quantity,
            supplier: msg.sender,
            isActive: true
        });

        suppliers[msg.sender].totalMedicinesListed++;

        emit MedicineAdded(medicineId, _name, _price, _quantity);
    }

    // Process Medicine Sale (called by patient contract)
    function processMedicineSale(
        uint256 _medicineId, 
        uint256 _quantity, 
        address _patient
    ) external {
        Medicine storage medicine = medicines[_medicineId];
        require(medicine.isActive, "Medicine not available");
        require(medicine.quantity >= _quantity, "Insufficient quantity");

        // Reduce medicine quantity
        medicine.quantity -= _quantity;

        // Record sales transaction
        salesHistory[_patient].push(SalesTransaction({
            medicineId: _medicineId,
            patient: _patient,
            quantity: _quantity,
            timestamp: block.timestamp
        }));

        emit MedicineSold(_medicineId, _patient, _quantity);
    }

    // Utility Functions
    function getMedicineDetails(uint256 _medicineId) public view returns (
        address supplier, 
        uint256 price, 
        uint256 availableQuantity
    ) {
        Medicine memory medicine = medicines[_medicineId];
        return (medicine.supplier, medicine.price, medicine.quantity);
    }

    function getSupplierMedicines(address _supplier) public view returns (Medicine[] memory) {
        Medicine[] memory supplierMedicines = new Medicine[](suppliers[_supplier].totalMedicinesListed);
        uint256 count = 0;
        
        for(uint256 i = 0; i < medicineCounter; i++) {
            if(medicines[i].supplier == _supplier) {
                supplierMedicines[count] = medicines[i];
                count++;
            }
        }
        
        return supplierMedicines;
    }
}
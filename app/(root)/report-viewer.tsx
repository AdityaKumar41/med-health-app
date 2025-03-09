import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from 'expo-document-picker';
import { useAccount } from 'wagmi';
import { usePatient } from '@/hooks/usePatient';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, router } from 'expo-router';
import { useSignedUrl } from '@/hooks/useAws';
import { useReportPost } from '@/hooks/useReport';
import ReportViewer from '@/components/ReportViewer';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Report {
    patient_id: string;
    appointment_id?: string;
    title: string;
    description?: string;
    file_url: string;
    file_type: string;
    file_size: number;
    report_type: string;
    report_date: string;
    is_verified?: boolean;
}

interface ReportFormData {
    title: string;
    description: string;
    report_type: string;
    report_date: string;
}

const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

type FormDataSetter = React.Dispatch<React.SetStateAction<ReportFormData>>;

const MedicalReports: React.FC = () => {
    const { address } = useAccount();
    const { data, isLoading } = usePatient(address!);
    const [uploading, setUploading] = useState(false);
    const navigation = useNavigation()
    const [showModal, setShowModal] = useState(false);
    const [showMediaGallery, setShowMediaGallery] = useState(false); // Add state for media gallery modal
    const [formData, setFormData] = useState<ReportFormData>({
        title: '',
        description: '',
        report_type: '',
        report_date: new Date().toISOString(), // This will give full ISO datetime
    });
    const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
    const { mutateAsync: getSignedUrl } = useSignedUrl(address!);
    const { mutateAsync: createReport } = useReportPost(address!);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const handleUpload = async () => {
        setShowModal(true);
    };

    const handleOpenMediaGallery = () => {
        setShowMediaGallery(true);
    };

    const handleSubmit = async () => {
        try {
            if (!selectedFile?.assets || selectedFile.assets.length === 0) {
                alert('Please select a file');
                return;
            }

            setUploading(true);
            const file = selectedFile.assets[0];

            // Get signed URL with error handling
            let signedUrlResponse;
            try {
                signedUrlResponse = await getSignedUrl({
                    filename: file.name,
                    filetype: file.mimeType || 'application/pdf'
                });
                console.log('Processed signed URL response:', signedUrlResponse);
            } catch (error) {
                console.error('SignedURL Error:', error);
                throw error;
            }

            // Upload file with explicit content type
            const contentType = file.mimeType || 'application/pdf';

            try {
                const fileResponse = await fetch(file.uri);
                const blob = await fileResponse.blob();

                const uploadResponse = await fetch(signedUrlResponse.url, {
                    method: 'PUT',
                    body: blob,
                    headers: {
                        'Content-Type': contentType
                    }
                });

                if (!uploadResponse.ok) {
                    throw new Error(`Upload failed with status: ${uploadResponse.status}`);
                }

                // Create report record
                const reportData = {
                    patient_id: data.id,
                    title: formData.title,
                    description: formData.description,
                    file_url: signedUrlResponse.key,
                    file_type: contentType,
                    file_size: file.size ?? 0,
                    report_type: formData.report_type,
                    report_date: new Date(formData.report_date).toISOString(), // Ensure ISO format
                    is_verified: false,
                };

                await createReport(reportData);

                // Reset form and close modal
                setShowModal(false);
                setUploading(false);
                setFormData({
                    title: '',
                    description: '',
                    report_type: '',
                    report_date: new Date().toISOString(),
                });
                setSelectedFile(null);

                Alert.alert('Success', 'Report uploaded successfully!');

            } catch (error) {
                throw new Error('Failed to upload file: ' + (error instanceof Error ? error.message : 'Unknown error'));
            }

        } catch (error) {
            console.error('Error uploading report:', error);
            setUploading(false);
            Alert.alert(
                'Error',
                `Upload failed: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
            );
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ALLOWED_FILE_TYPES,
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets?.[0]) {
                const file = result.assets[0];
                if (!ALLOWED_FILE_TYPES.includes(file.mimeType || '')) {
                    Alert.alert('Error', 'Invalid file type. Please select a PDF or image file.');
                    return;
                }
                setSelectedFile(result);
            }
        } catch (error) {
            console.error('Error picking document:', error);
            Alert.alert('Error', 'Failed to select document');
        }
    };

    const formatDateForDisplay = (isoString: string) => {
        return new Date(isoString).toLocaleDateString();
    };

    const handleDateChange = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date format');
            }
            setFormData(prev => ({
                ...prev,
                report_date: date.toISOString()
            }));
        } catch (error) {
            Alert.alert('Error', 'Please enter a valid date in YYYY-MM-DD format');
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#0066CC" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar style="dark" />

            {/* Header */}
            <View className="bg-white px-4 pt-6 pb-4">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="p-2"
                    >
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-JakartaBold text-gray-900">Medical Reports</Text>
                    <TouchableOpacity
                        onPress={handleOpenMediaGallery}
                        disabled={uploading}
                        className="bg-blue-500 p-2 rounded-full"
                    >
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Loading Overlay */}
            {uploading && (
                <View className="absolute top-1/2 left-0 right-0 items-center z-10">
                    <View className="bg-white p-4 rounded-lg shadow-lg">
                        <ActivityIndicator color="#0066CC" />
                        <Text className="mt-2 font-JakartaMedium">Uploading report...</Text>
                    </View>
                </View>
            )}

            {/* Content Area */}
            <View className="flex-1 bg-gray-50">
                <ScrollView className="flex-1 px-4 pt-4">
                    {data?.reports && data.reports.length > 0 ? (
                        data.reports.map((report: Report, index: number) => (
                            <ReportCard
                                key={index}
                                report={report}
                                onPress={() => setSelectedReport(report)}
                            />
                        ))
                    ) : (
                        <EmptyState />
                    )}
                </ScrollView>
            </View>

            {/* Modals */}
            <ReportFormModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleSubmit}
                formData={{
                    ...formData,
                    report_date: formatDateForDisplay(formData.report_date)
                }}
                setFormData={setFormData}
                onPickDocument={pickDocument}
                selectedFile={selectedFile}
                uploading={uploading}
                onDateChange={handleDateChange}
            />

            {selectedReport && (
                <ReportViewer
                    visible={!!selectedReport}
                    onClose={() => setSelectedReport(null)}
                    fileUrl={selectedReport.file_url}
                    fileType={selectedReport.file_type}
                    title={selectedReport.title}
                />
            )}

            {/* Media Gallery Modal */}
            <MediaGalleryModal
                visible={showMediaGallery}
                onClose={() => setShowMediaGallery(false)}
                reports={data?.reports || []}
                onReportSelect={(report) => {
                    setSelectedReport(report);
                    setShowMediaGallery(false);
                }}
                onAddNew={() => {
                    setShowMediaGallery(false);
                    setShowModal(true);
                }}
            />
        </SafeAreaView>
    );
};

interface ReportFormModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: () => void;
    formData: ReportFormData;
    setFormData: FormDataSetter;
    onPickDocument: () => void;
    selectedFile: DocumentPicker.DocumentPickerResult | null;
    uploading: boolean;
    onDateChange: (date: string) => void;
}

const ReportFormModal = ({
    visible,
    onClose,
    onSubmit,
    formData,
    setFormData,
    onPickDocument,
    selectedFile,
    uploading,
    onDateChange
}: ReportFormModalProps) => (
    <Modal visible={visible} animationType="slide" transparent>
        <SafeAreaView className="flex-1 bg-black/50" edges={['top', 'left', 'right']}>
            <View className="flex-1 justify-end">
                <View className="bg-white rounded-t-3xl p-6 pb-8">
                    <View className="flex-row justify-between items-center py-3 mb-4">
                        <Text className="text-xl font-JakartaBold">Upload Medical Report</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            className="h-12 w-12 rounded-full justify-center items-center"
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="close-circle" size={32} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="max-h-[500px]">
                        <View className="space-y-4">
                            <View>
                                <Text className="font-JakartaMedium mb-2">Title *</Text>
                                <TextInput
                                    className="border border-gray-200 rounded-lg p-3 font-Jakarta"
                                    value={formData.title}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                                    placeholder="Enter report title"
                                />
                            </View>

                            <View>
                                <Text className="font-JakartaMedium mb-2">Description</Text>
                                <TextInput
                                    className="border border-gray-200 rounded-lg p-3 font-Jakarta"
                                    value={formData.description}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                                    placeholder="Enter description"
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>

                            <View>
                                <Text className="font-JakartaMedium mb-2">Report Type *</Text>
                                <TextInput
                                    className="border border-gray-200 rounded-lg p-3 font-Jakarta"
                                    value={formData.report_type}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, report_type: text }))}
                                    placeholder="e.g., Blood Test, X-Ray, etc."
                                />
                            </View>

                            <View>
                                <Text className="font-JakartaMedium mb-2">Report Date *</Text>
                                <TextInput
                                    className="border border-gray-200 rounded-lg p-3 font-Jakarta"
                                    value={formData.report_date}
                                    onChangeText={onDateChange}
                                    placeholder="YYYY-MM-DD"
                                />
                            </View>

                            <TouchableOpacity
                                onPress={onPickDocument}
                                className="border-2 border-dashed border-blue-500 rounded-lg p-4 items-center"
                            >
                                <Ionicons name="cloud-upload" size={32} color="#0066CC" />
                                <Text className="font-JakartaMedium text-blue-500 mt-2">
                                    {selectedFile && 'assets' in selectedFile && selectedFile.assets?.[0]
                                        ? selectedFile.assets[0].name
                                        : 'Select Document'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                    <TouchableOpacity
                        onPress={onSubmit}
                        disabled={uploading || !formData.title || !formData.report_type || !selectedFile}
                        className={`mt-6 rounded-lg p-5 items-center ${uploading || !formData.title || !formData.report_type || !selectedFile
                            ? 'bg-gray-300'
                            : 'bg-blue-600'
                            }`}
                        activeOpacity={0.7}
                    >
                        {uploading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="font-JakartaBold text-white">Upload Report</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    </Modal>
);

interface MediaGalleryModalProps {
    visible: boolean;
    onClose: () => void;
    reports: Report[];
    onReportSelect: (report: Report) => void;
    onAddNew: () => void;
}

const MediaGalleryModal = ({
    visible,
    onClose,
    reports,
    onReportSelect,
    onAddNew
}: MediaGalleryModalProps) => {
    return (
        <Modal visible={visible} animationType="slide" transparent>
            <SafeAreaView className="flex-1 bg-black/50" edges={['top', 'left', 'right']}>
                <View className="flex-1 justify-end">
                    <View className="bg-white rounded-t-3xl h-[80%] pb-6">
                        {/* Header with improved touchable area for close button */}
                        <View className="flex-row justify-between items-center py-6 px-5 border-b border-gray-200">
                            <Text className="text-xl font-JakartaBold">Media Gallery</Text>
                            <TouchableOpacity
                                onPress={onClose}
                                className="h-12 w-12 rounded-full justify-center items-center" // Circular touch area
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Extend touch area
                            >
                                <Ionicons name="close-circle" size={32} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="flex-1 p-4 pb-8" contentContainerStyle={{ paddingBottom: 20 }}>
                            {reports.length > 0 ? (
                                <View className="flex-row flex-wrap justify-between">
                                    {reports.map((report, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            className="w-[48%] bg-gray-100 rounded-lg mb-4 overflow-hidden shadow-sm"
                                            onPress={() => onReportSelect(report)}
                                            activeOpacity={0.7}
                                        >
                                            <View className="h-32 bg-blue-100 justify-center items-center">
                                                <Ionicons
                                                    name={report.file_type.includes('pdf') ? "document-text" : "image"}
                                                    size={40}
                                                    color="#0066CC"
                                                />
                                            </View>
                                            <View className="p-3">
                                                <Text numberOfLines={1} className="font-JakartaBold text-gray-800">
                                                    {report.title}
                                                </Text>
                                                <Text className="font-Jakarta text-gray-500 text-xs mt-1">
                                                    {new Date(report.report_date).toLocaleDateString()}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}

                                    {/* Add new report tile */}
                                    <TouchableOpacity
                                        className="w-[48%] bg-gray-100 rounded-lg mb-4 border-2 border-dashed border-blue-500 h-32 justify-center items-center shadow-sm"
                                        onPress={onAddNew}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="add-circle" size={40} color="#0066CC" />
                                        <Text className="font-JakartaMedium text-blue-500 mt-2">Add New</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View className="flex-1 justify-center items-center py-20">
                                    <View className="bg-blue-100 p-4 rounded-full mb-4">
                                        <Ionicons name="images" size={32} color="#0066CC" />
                                    </View>
                                    <Text className="font-JakartaBold text-lg text-gray-800 mb-2">No Media Yet</Text>
                                    <Text className="font-Jakarta text-gray-500 text-center px-10 mb-4">
                                        Upload your medical reports to keep track of your health records
                                    </Text>
                                    <TouchableOpacity
                                        className="bg-blue-600 py-3 px-6 rounded-lg"
                                        onPress={onAddNew}
                                        activeOpacity={0.7}
                                    >
                                        <Text className="font-JakartaBold text-white">Upload Report</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const ReportCard = ({ report, onPress }: { report: Report, onPress: () => void }) => (
    <TouchableOpacity
        className="bg-white p-4 rounded-xl mb-3 shadow-sm flex-row items-center"
        onPress={onPress}
    >
        <View className="bg-blue-100 p-2 rounded-lg">
            <Ionicons
                name={report.file_type.includes('pdf') ? "document-text" : "image"}
                size={24}
                color="#0066CC"
            />
        </View>
        <View className="flex-1 ml-3">
            <Text className="font-JakartaBold text-gray-800">{report.title}</Text>
            <Text className="font-Jakarta text-gray-500 text-sm">
                {new Date(report.report_date).toLocaleDateString()}
            </Text>
            <Text className="font-Jakarta text-gray-400 text-xs mt-1">
                {report.report_type}
            </Text>
        </View>
        <Ionicons name="eye-outline" size={20} color="#666" />
    </TouchableOpacity>
);

const EmptyState = () => (
    <View className="flex-1 justify-center items-center py-20">
        <View className="bg-blue-100 p-4 rounded-full mb-4">
            <Ionicons name="document-text" size={32} color="#0066CC" />
        </View>
        <Text className="font-JakartaBold text-lg text-gray-800 mb-2">No Reports Yet</Text>
        <Text className="font-Jakarta text-gray-500 text-center px-10">
            Upload your medical reports to keep track of your health records
        </Text>
    </View>
);

export default MedicalReports;

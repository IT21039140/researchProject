import React, { useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { FaArrowLeft, FaArrowRight, FaCheck } from 'react-icons/fa';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import './Styles/SupportChat.css';

function SupportChat() {
    const [step, setStep] = useState(0);
    const [name, setName] = useState('');
    const [year, setYear] = useState('');
    const [stream, setStream] = useState('');
    const [subjects, setSubjects] = useState([{ subject: '', result: '' }]);
    const [englishGrade, setEnglishGrade] = useState('');
    const [universityType, setUniversityType] = useState('');
    const [locations, setLocations] = useState([]);
    const [careerAreas, setCareerAreas] = useState([]);
    const [areas, setAreas] = useState([]);
    const [duration, setDuration] = useState('');
    const [ranking, setRanking] = useState([]);

    const streamOptions = [
        'Biological Science Stream', 'Physical Science Stream', 'Commerce Stream',
        'Engineering Technology Stream', 'Bio Technology Stream'
    ];

    const areaOptions = {
        'Biological Science Stream': [
            'Medicine & Health Care', 'Environmental Sciences', 'Information Technology & Management',
            'Architecture & Design', 'Agricultural Sciences', 'Science & Technology', 'Business & Management',
            'Arts & Humanities', 'Law', 'Tourism & Hospitality'
        ],
        'Physical Science Stream': [
            'Engineering', 'Architecture & Design', 'Statistics & Mathematics', 'Business & Management',
            'Computer Science & Information Technology', 'Arts & Humanities', 'Science & Technology',
            'Geographical & Environmental Sciences', 'Hospitality & Tourism', 'Law'
        ],
        'Commerce Stream': [
            'Business & Management', 'Law', 'Finance & Economics', 'Arts & Humanities', 'Information Technology & Management',
            'Architecture & Design', 'Science & Technology', 'Geographical & Environmental Sciences',
            'Hospitality & Tourism'
        ],
        'Engineering Technology Stream': [
            'Information Technology & Management', 'Engineering Technology', 'Science & Technology',
            'Arts & Humanities', 'Law', 'Education', 'Architecture & Design', 'Hospitality & Tourism',
            'Geographical & Environmental Sciences', 'Business & Management'
        ],
        'Bio Technology Stream': [
            'Biosystems Technology', 'Science & Technology', 'Hospitality & Tourism', 'Geographical & Environmental Sciences',
            'Business & Management', 'Law', 'Education', 'Information Technology & Management',
            'Arts & Humanities', 'Architecture & Design'
        ]
    };

    const handleNextStep = () => {
        setStep(step + 1);
    };

    const handleBackStep = () => {
        setStep(step - 1);
    };

    const handleStreamSelect = (e) => {
        setStream(e.target.value);
        const selectedAreas = areaOptions[e.target.value] || [];
        setAreas(selectedAreas);
        setRanking(selectedAreas);
        setStep(3);  // Move to the next step after selecting the stream
    };

    const handleSubjectsChange = (index, field, value) => {
        const updatedSubjects = [...subjects];
        updatedSubjects[index][field] = value;
        setSubjects(updatedSubjects);
    };

    const handleAddSubject = () => {
        setSubjects([...subjects, { subject: '', result: '' }]);
    };

    const handleRemoveSubject = (index) => {
        const updatedSubjects = subjects.filter((_, i) => i !== index);
        setSubjects(updatedSubjects);
    };

    const handleLocationsChange = (e) => {
        const selectedLocations = Array.from(e.target.selectedOptions, option => option.value);
        setLocations(selectedLocations);
    };

    const handleCareerAreasChange = (e) => {
        const selectedCareers = Array.from(e.target.selectedOptions, option => option.value);
        setCareerAreas(selectedCareers);
    };

    const handleDurationChange = (e) => {
        setDuration(e.target.value);
    };

    const handleRankingChange = (result) => {
        const reorderedAreas = Array.from(ranking);
        const [movedItem] = reorderedAreas.splice(result.source.index, 1);
        reorderedAreas.splice(result.destination.index, 0, movedItem);
        setRanking(reorderedAreas);
    };

    const renderStepContent = () => {
        switch (step) {
            case 0:
                return (
                    <Card className="chat-bubble bot">
                        <Card.Body>
                            <p>Hello! 👋</p>
                            <p>Welcome to our personalized university course recommendation system.</p>
                            <p>I'm here to help you find the best courses based on your interests and goals.</p>
                            <p>Shall we get started?</p>
                            <div className="d-flex justify-content-between">
                                <Button onClick={handleNextStep}>Yes, let's start! <FaArrowRight /></Button>
                            </div>
                        </Card.Body>
                    </Card>
                );
            case 1:
                return (
                    <Card className="chat-bubble bot">
                        <Card.Body>
                            <Form>
                                <Form.Group>
                                    <Form.Label>Enter the student's name:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Select year:</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                    >
                                        <option value="">Select year</option>
                                        <option value="2024">2024</option>
                                        <option value="2023">2023</option>
                                        {/* Add more years as needed */}
                                    </Form.Control>
                                </Form.Group>
                                <div className="d-flex justify-content-between">
                                    <Button variant="outline-secondary" disabled><FaArrowLeft /> Back</Button>
                                    <Button onClick={handleNextStep}>Next <FaArrowRight /></Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                );
            case 2:
                return (
                    <Card className="chat-bubble bot">
                        <Card.Body>
                            <Form>
                                <Form.Group>
                                    <Form.Label>Select your stream:</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={stream}
                                        onChange={handleStreamSelect}
                                    >
                                        <option value="">Select stream</option>
                                        {streamOptions.map((stream) => (
                                            <option key={stream} value={stream}>{stream}</option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                                <div className="d-flex justify-content-between">
                                    <Button onClick={handleBackStep}><FaArrowLeft /> Back</Button>
                                    <Button onClick={handleNextStep}>Next <FaArrowRight /></Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                );
            case 3:
                return (
                    <Card className="chat-bubble bot">
                        <Card.Body>
                            <Form>
                                {subjects.map((subject, index) => (
                                    <div key={index} className="mb-2">
                                        <Form.Group>
                                            <Form.Label>Subject {index + 1}:</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={subject.subject}
                                                onChange={(e) => handleSubjectsChange(index, 'subject', e.target.value)}
                                            />
                                        </Form.Group>
                                        <Form.Group>
                                            <Form.Label>Result:</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={subject.result}
                                                onChange={(e) => handleSubjectsChange(index, 'result', e.target.value)}
                                            />
                                        </Form.Group>
                                        <Button variant="danger" onClick={() => handleRemoveSubject(index)}>Remove</Button>
                                    </div>
                                ))}
                                <Button onClick={handleAddSubject}>Add Subject</Button>
                                <div className="d-flex justify-content-between mt-2">
                                    <Button onClick={handleBackStep}><FaArrowLeft /> Back</Button>
                                    <Button onClick={handleNextStep}>Next <FaArrowRight /></Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                );
            case 4:
                return (
                    <Card className="chat-bubble bot">
                        <Card.Body>
                            <Form>
                                <Form.Group>
                                    <Form.Label>Select English grade:</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={englishGrade}
                                        onChange={(e) => setEnglishGrade(e.target.value)}
                                    >
                                        <option value="">Select grade</option>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                        <option value="S">S</option>
                                        <option value="W">W</option>
                                    </Form.Control>
                                </Form.Group>
                                <div className="d-flex justify-content-between">
                                    <Button onClick={handleBackStep}><FaArrowLeft /> Back</Button>
                                    <Button onClick={handleNextStep}>Next <FaArrowRight /></Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                );
            case 5:
                return (
                    <Card className="chat-bubble bot">
                        <Card.Body>
                            <Form>
                                <Form.Group>
                                    <Form.Label>Select preferred university type:</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={universityType}
                                        onChange={(e) => setUniversityType(e.target.value)}
                                    >
                                        <option value="">Select university type</option>
                                        <option value="Government">Government</option>
                                        <option value="Private">Private</option>
                                    </Form.Control>
                                </Form.Group>
                                <div className="d-flex justify-content-between">
                                    <Button onClick={handleBackStep}><FaArrowLeft /> Back</Button>
                                    <Button onClick={handleNextStep}>Next <FaArrowRight /></Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                );
            case 6:
                return (
                    <Card className="chat-bubble bot">
                        <Card.Body>
                            <Form>
                                <Form.Group>
                                    <Form.Label>Select preferred locations:</Form.Label>
                                    <Form.Control
                                        as="select"
                                        multiple
                                        value={locations}
                                        onChange={handleLocationsChange}
                                    >
                                        <option value="Western Province">Western Province</option>
                                        <option value="Uva Province">Uva Province</option>
                                        <option value="Central Province">Central Province</option>
                                        <option value="Southern Province">Southern Province</option>
                                        <option value="Sabaragamuwa Province">Sabaragamuwa Province</option>
                                        <option value="Eastern Province">Eastern Province</option>
                                        <option value="Northern Province">Northern Province</option>
                                        <option value="North Western Province">North Western Province</option>
                                        <option value="North Central Province">North Central Province</option>
                                    </Form.Control>
                                </Form.Group>
                                <div className="d-flex justify-content-between">
                                    <Button onClick={handleBackStep}><FaArrowLeft /> Back</Button>
                                    <Button onClick={handleNextStep}>Next <FaArrowRight /></Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                );
            case 7:
                return (
                    <Card className="chat-bubble bot">
                        <Card.Body>
                            <Form>
                                <Form.Group>
                                    <Form.Label>Select career areas:</Form.Label>
                                    <Form.Control
                                        as="select"
                                        multiple
                                        value={careerAreas}
                                        onChange={handleCareerAreasChange}
                                    >
                                        <option value="Medicine & Health Care">Medicine & Health Care</option>
                                        <option value="Environmental Sciences">Environmental Sciences</option>
                                        <option value="Information Technology & Management">Information Technology & Management</option>
                                        <option value="Architecture & Design">Architecture & Design</option>
                                        <option value="Agricultural Sciences">Agricultural Sciences</option>
                                        <option value="Science & Technology">Science & Technology</option>
                                        <option value="Business & Management">Business & Management</option>
                                        <option value="Arts & Humanities">Arts & Humanities</option>
                                        <option value="Law">Law</option>
                                        <option value="Tourism & Hospitality">Tourism & Hospitality</option>
                                    </Form.Control>
                                </Form.Group>
                                <div className="d-flex justify-content-between">
                                    <Button onClick={handleBackStep}><FaArrowLeft /> Back</Button>
                                    <Button onClick={handleNextStep}>Next <FaArrowRight /></Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                );
            case 8:
                return (
                    <Card className="chat-bubble bot">
                        <Card.Body>
                            <Form>
                                <Form.Group>
                                    <Form.Label>Drag to rank your preferred areas:</Form.Label>
                                    <DragDropContext onDragEnd={handleRankingChange}>
                                        <Droppable droppableId="areas">
                                            {(provided) => (
                                                <ul
                                                    {...provided.droppableProps}
                                                    ref={provided.innerRef}
                                                    className="list-unstyled"
                                                >
                                                    {ranking.map((area, index) => (
                                                        <Draggable key={area} draggableId={area} index={index}>
                                                            {(provided) => (
                                                                <li
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className="mb-2 border p-2 rounded"
                                                                >
                                                                    {area}
                                                                </li>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </ul>
                                            )}
                                        </Droppable>
                                    </DragDropContext>
                                </Form.Group>
                                <div className="d-flex justify-content-between">
                                    <Button onClick={handleBackStep}><FaArrowLeft /> Back</Button>
                                    <Button onClick={handleNextStep}>Next <FaArrowRight /></Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                );
            case 9:
                return (
                    <Card className="chat-bubble bot">
                        <Card.Body>
                            <Form>
                                <Form.Group>
                                    <Form.Label>Select preferred course duration:</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={duration}
                                        onChange={handleDurationChange}
                                    >
                                        <option value="">Select duration</option>
                                        <option value="1 year">1 year</option>
                                        <option value="2 years">2 years</option>
                                        <option value="3 years">3 years</option>
                                        <option value="4 years">4 years</option>
                                        <option value="5 years">5 years</option>
                                        <option value="6 years">6 years</option>
                                    </Form.Control>
                                </Form.Group>
                                <div className="d-flex justify-content-between">
                                    <Button onClick={handleBackStep}><FaArrowLeft /> Back</Button>
                                    <Button onClick={handleNextStep}>Next <FaArrowRight /></Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                );
            case 10:
                return (
                    <Card className="chat-bubble bot">
                        <Card.Body>
                            <p>Thank you for providing all the information! We are now processing your preferences.</p>
                            <p>You will receive your personalized course recommendations shortly.</p>
                        </Card.Body>
                    </Card>
                );
            default:
                return null;
        }
    };

    return (
        <div className="support-chat">
            <Card className="chat-box">
                <Card.Body>
                    {renderStepContent()}
                </Card.Body>
            </Card>
            <div className="chat-footer">
                <Button className="chat-icon" onClick={() => setStep(0)}>
                    <FaArrowLeft />
                </Button>
            </div>
        </div>
    );
}

export default SupportChat;

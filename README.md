# SWProject: Academic Paper Search Engine

### Description:
Our project aims to develop a specialized search engine dedicated to academic papers, serving as a comprehensive resource for students, professors, researchers, and industry experts. Designed with ease of access in mind, it provides a single platform where users can find and explore scholarly articles and publications across various fields. Beyond simple search functionality, our search engine will offer personalized recommendations based on individual search histories. By analyzing user interactions, it will suggest relevant papers and topics, tailoring content to align with users' interests and research needs. This feature is intended to not only enhance the user experience but also to inspire discovery and learning by connecting users with content that resonates with their current interests and professional pursuits.

The project is hosted using Digital Ocean.
Link: http://165.227.74.112:3000/

### Major Features:

Here are some major features of our project.
* Advanced Search Options: This will allow users to search by keywords, authors, publication dates, journals, and citation metrics.
* Download Papers:  Users will have the ability to seamlessly download white papers directly from the platform.
* Filtering and Sorting: This should enable users to filter search results by relevance, publication date, citation count, and journal impact factor.
* Relevance Ranking: Our search engine should prioritize the most relevant and impactful research papers on top.
* Citation Analysis: The search engine should provide information on the number of citations a paper has received and its overall impact in the field.
* User Profiles: This should allow users to create profiles, save favorite papers, create reading lists, follow authors, and organize papers into folders or tags.
* Notification and Alerts: We can provide customizable alerts for new papers matching users' interests and updates on citations on their published papers.
* Mobile-Friendly Interface: We have to make sure the search engine is responsive and optimized for mobile devices. This will also allow easy access of papers to the users.

## Technical Stack

- **Frontend**: React.js, enabling dynamic interactions and real-time updates.
- **Backend**: Django framework, ensuring server-side logic.
- **Database**: PostgreSQL, used for storing user profiles/information.
- **Containerization**: Docker, utilized consistent deployment environments across various platforms.
- **Authentication**: Auth for secure user authentication, supporting third-party logins like Google and email.
- **APIs**: RESTful APIs for seamless frontend-backend integration.
- **Cloud Services**: AWS, for scalable cloud hosting and storage solutions.
- **Development Tools**: Git for version control, hosted on GitHub for collaborative development.

## Installation

### Prerequisites
- Docker installed on your machine. Visit [Docker's website](https://www.docker.com/get-started) for installation instructions.

### Running with Docker
1. **Clone the repository**:
    ```bash
    git clone https://github.com/ShaktidharK1997/SWProject.git

2. **Navigate to the project directory**:
    ```bash
    cd SWProject

3. **Build the Docker Container**:
    ```bash
    docker-compose build 
4. **Run the Containers**:
    ```bash
    docker-compose up

5. **Accessing the Application**:
    Once the containers are running, you can access the application at:

    Frontend: http://localhost:3000 (or the port you have configured)
    Backend/API: http://localhost:8000 (or the port you have configured)
6. **Stopping the Containers**:
    ```bash
    docker-compose down

The application will be available at `http://localhost:3000`. This setup uses Docker to encapsulate the application environment, ensuring consistency across different development and production setups.

## High Level Context Analysis

<img width="623" alt="High Level Context Analysis Diagram" src="https://github.com/ShaktidharK1997/SWProject/assets/59786881/c59ca856-67ba-4cce-b3fc-b571cc7b9254">

## High Level Diagrams

### Home Page and Basic Search

<img width="622" alt="Home Page and Basic Search" src="https://github.com/ShaktidharK1997/SWProject/assets/59786881/ce729f07-c209-4f26-8173-362676503040">

### Paper Info Page

<img width="619" alt="Paper Info Page" src="https://github.com/ShaktidharK1997/SWProject/assets/59786881/cb78e9f3-a528-4efb-8cfd-b6e340c792ef">

### User Profile

<img width="621" alt="User Profile" src="https://github.com/ShaktidharK1997/SWProject/assets/59786881/3a27ef66-546f-422f-803a-f55bbc1a15e1">

### Account Registration and Login

<img width="617" alt="Account Registration and Login" src="https://github.com/ShaktidharK1997/SWProject/assets/59786881/edf5efaf-7a3d-4a42-809c-6ca53f81ad9d">








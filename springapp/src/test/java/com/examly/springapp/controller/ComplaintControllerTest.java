//package com.examly.springapp.controller;
//
//import com.examly.springapp.model.Complaint;
//import com.examly.springapp.repository.ComplaintRepository;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.http.MediaType;
//import org.springframework.test.context.ActiveProfiles;
//import org.springframework.test.web.servlet.MockMvc;
//
//import java.time.LocalDateTime;
//
//import static org.hamcrest.Matchers.*;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
//
//@SpringBootTest
//@AutoConfigureMockMvc
//@ActiveProfiles("test")
//public class ComplaintControllerTest {
//    @Autowired
//    private MockMvc mockMvc;
//
//    @Autowired
//    private ComplaintRepository repository;
//
//    @Autowired
//    private ObjectMapper objectMapper;
//
//    @BeforeEach
//    void setUp() {
//        repository.deleteAll();
//    }
//
//        @Test
//        void testCreateComplaint() throws Exception {
//                Complaint c = Complaint.builder()
//                        .title("Broken Street Light")
//                        .description("The street light at the corner of Main St. and 5th Ave. has been out for a week.")
//                        .category("INFRASTRUCTURE")
//                        .submittedBy("John Doe")
//                        .submitterEmail("john.doe@example.com")
//                        .build();
//                mockMvc.perform(post("/api/complaints")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(c)))
//                        .andExpect(status().isCreated())
//                        .andExpect(jsonPath("$.title", is("Broken Street Light")))
//                        .andExpect(jsonPath("$.status", is("PENDING")))
//                        .andExpect(jsonPath("$.priority", is("MEDIUM")))
//                        .andExpect(jsonPath("$.submittedBy", is("John Doe")));
//        }
//        @Test
//        void testCreateComplaintValidationFail() throws Exception {
//                Complaint c = Complaint.builder()
//                        .title("")
//                        .description("Short")
//                        .category("INVALID")
//                        .submittedBy("J")
//                        .submitterEmail("bademail")
//                        .build();
//                mockMvc.perform(post("/api/complaints")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(c)))
//                        .andExpect(status().isBadRequest())
//                        .andExpect(jsonPath("$.message", not(emptyOrNullString())));
//        }
//        @Test
//        void testGetAllComplaints() throws Exception {
//                Complaint c1 = Complaint.builder()
//                        .title("Complaint 1")
//                        .description("Description one with more than 10 chars.")
//                        .category("SERVICE")
//                        .submittedBy("Alice Smith")
//                        .submitterEmail("alice.smith@example.com")
//                        .submittedDate(LocalDateTime.now())
//                        .status("PENDING").priority("HIGH")
//                        .build();
//                Complaint c2 = Complaint.builder()
//                        .title("Complaint 2")
//                        .description("Description two with more than 10 chars.")
//                        .category("PERSONNEL")
//                        .submittedBy("Bob Brown")
//                        .submitterEmail("bob.brown@example.com")
//                        .submittedDate(LocalDateTime.now())
//                        .status("RESOLVED").priority("LOW")
//                        .build();
//                repository.save(c1);
//                repository.save(c2);
//                mockMvc.perform(get("/api/complaints"))
//                        .andExpect(status().isOk())
//                        .andExpect(jsonPath("$", hasSize(2)));
//        }
//        @Test
//        void testGetComplaintByIdSuccessAndNotFound() throws Exception {
//                Complaint complaint = Complaint.builder()
//                        .title("Test Complaint")
//                        .description("Description more than 10 chars.")
//                        .category("SERVICE")
//                        .submittedBy("Eve Long")
//                        .submitterEmail("eve.long@example.com")
//                        .submittedDate(LocalDateTime.now())
//                        .status("IN_PROGRESS").priority("MEDIUM")
//                        .build();
//                Complaint saved = repository.save(complaint);
//                // Success
//                mockMvc.perform(get("/api/complaints/" + saved.getId()))
//                        .andExpect(status().isOk())
//                        .andExpect(jsonPath("$.title", is("Test Complaint")));
//                // Not found
//                mockMvc.perform(get("/api/complaints/999999"))
//                        .andExpect(status().isNotFound())
//                        .andExpect(jsonPath("$.message", containsString("not found")));
//        }
//        @Test
//        void testGetComplaintsByStatus() throws Exception {
//                Complaint c1 = Complaint.builder()
//                        .title("Complaint 1")
//                        .description("Description one for status filter.")
//                        .category("INFRASTRUCTURE")
//                        .submittedBy("User A")
//                        .submitterEmail("a@b.com")
//                        .submittedDate(LocalDateTime.now())
//                        .status("PENDING").priority("MEDIUM")
//                        .build();
//                Complaint c2 = Complaint.builder()
//                        .title("Complaint 2")
//                        .description("Description two for status filter.")
//                        .category("SERVICE")
//                        .submittedBy("User B")
//                        .submitterEmail("b@c.com")
//                        .submittedDate(LocalDateTime.now())
//                        .status("RESOLVED").priority("LOW")
//                        .build();
//                repository.save(c1);
//                repository.save(c2);
//                // Valid
//                mockMvc.perform(get("/api/complaints/status/RESOLVED"))
//                        .andExpect(status().isOk())
//                        .andExpect(jsonPath("$", hasSize(1)));
//                // Invalid
//                mockMvc.perform(get("/api/complaints/status/WRONGSTATUS"))
//                        .andExpect(status().isBadRequest())
//                        .andExpect(jsonPath("$.message", containsString("Invalid status")));
//        }
//        @Test
//        void testUpdateComplaintStatusWithoutOptionalFields() throws Exception {
//        Complaint comp = Complaint.builder()
//                .title("Status Update Test")
//                .description("Testing status update without comments or assignee")
//                .category("SERVICE")
//                .submittedBy("Update User")
//                .submitterEmail("update@example.com")
//                .status("PENDING").priority("MEDIUM")
//                .submittedDate(LocalDateTime.now())
//                .build();
//        Complaint saved = repository.save(comp);
//
//        String updateJson = "{\"status\":\"IN_PROGRESS\"}";
//
//        mockMvc.perform(put("/api/complaints/" + saved.getId() + "/status")
//                .contentType(MediaType.APPLICATION_JSON)
//                .content(updateJson))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.status", is("IN_PROGRESS")))
//                .andExpect(jsonPath("$.assignedTo").doesNotExist())
//                .andExpect(jsonPath("$.resolutionComments").doesNotExist());
//        }
//        @Test
//        void testCreateComplaintWithMinBoundaryDescription() throws Exception {
//        Complaint c = Complaint.builder()
//                .title("Streetlight")
//                .description("1234567890") // Exactly 10 chars
//                .category("SERVICE")
//                .submittedBy("Boundary Test")
//                .submitterEmail("test@example.com")
//                .build();
//
//        mockMvc.perform(post("/api/complaints")
//                .contentType(MediaType.APPLICATION_JSON)
//                .content(objectMapper.writeValueAsString(c)))
//                .andExpect(status().isCreated())
//                .andExpect(jsonPath("$.description", is("1234567890")));
//        }
//        @Test
//        void testGetComplaintAfterDelete() throws Exception {
//        Complaint comp = Complaint.builder()
//                .title("Delete Me")
//                .description("Will be deleted")
//                .category("PERSONNEL")
//                .submittedBy("Delete Test")
//                .submitterEmail("delete@example.com")
//                .status("PENDING").priority("LOW")
//                .submittedDate(LocalDateTime.now())
//                .build();
//        Complaint saved = repository.save(comp);
//        repository.deleteById(saved.getId());
//
//        mockMvc.perform(get("/api/complaints/" + saved.getId()))
//                .andExpect(status().isNotFound())
//                .andExpect(jsonPath("$.message", containsString("not found")));
//        }
//        @Test
//        void testUpdateComplaintStatus() throws Exception {
//        Complaint comp = Complaint.builder()
//                .title("Resolve This")
//                .description("Needs fixing and proper attention.")
//                .category("INFRASTRUCTURE")
//                .submittedBy("Fixer Smith")
//                .submitterEmail("fixer@example.com")
//                .submittedDate(LocalDateTime.now())
//                .status("IN_PROGRESS").priority("HIGH")
//                .build();
//        Complaint saved = repository.save(comp);
//        // Update to RESOLVED
//        String updateJson = "{" +
//                "\"status\":\"RESOLVED\"," +
//                "\"assignedTo\":\"Admin User\"," +
//                "\"resolutionComments\":\"Fixed the issue successfully.\"}";
//        mockMvc.perform(put("/api/complaints/" + saved.getId() + "/status")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(updateJson))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.status", is("RESOLVED")))
//                .andExpect(jsonPath("$.assignedTo", is("Admin User")))
//                .andExpect(jsonPath("$.resolutionComments", is("Fixed the issue successfully.")))
//                .andExpect(jsonPath("$.resolvedDate", notNullValue()));
//        // 404
//        mockMvc.perform(put("/api/complaints/99999/status")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(updateJson))
//                .andExpect(status().isNotFound())
//                .andExpect(jsonPath("$.message", containsString("not found")));
//        // Invalid status
//        mockMvc.perform(put("/api/complaints/" + saved.getId() + "/status")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content("{\"status\":\"INVALID\"}"))
//                .andExpect(status().isBadRequest())
//                .andExpect(jsonPath("$.message", containsString("Invalid status")));
//        }
//}

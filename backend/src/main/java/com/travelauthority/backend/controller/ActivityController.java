package com.travelauthority.backend.controller;

import com.travelauthority.backend.dto.ActivityDTO;
import com.travelauthority.backend.dto.ResponseDTO;
import com.travelauthority.backend.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/api/v1/activity")
@CrossOrigin
@RestController
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    @PostMapping("/save")
    public ResponseDTO<ActivityDTO> saveActivity(@RequestBody ActivityDTO activityDTO, @RequestHeader(value = "X-User-Email", required = false) String userEmail) {
        // Set the creator information based on the authenticated user
        if (userEmail != null && !userEmail.isEmpty()) {
            activityDTO.setCreatedBy(userEmail);
        } else {
            activityDTO.setCreatedBy("System");
        }
        return activityService.saveActivity(activityDTO);
    }

    @GetMapping("/all")
    public ResponseDTO<List<ActivityDTO>> getAllActivities() {
        return activityService.getAllActivities();
    }

    @GetMapping("/{id}")
    public ResponseDTO<ActivityDTO> getActivityById(@PathVariable int id) {
        return activityService.getActivityById(id);
    }

    @PutMapping("/update/{id}")
    public ResponseDTO<ActivityDTO> updateActivity(@PathVariable int id, @RequestBody ActivityDTO activityDTO, 
            @RequestHeader(value = "X-User-Email", required = false) String userEmail) {
        // Preserve creator information if it's being updated
        if (userEmail != null && !userEmail.isEmpty()) {
            activityDTO.setCreatedBy(userEmail);
        }
        return activityService.updateActivity(id, activityDTO);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseDTO<Void> deleteActivity(@PathVariable int id) {
        return activityService.deleteActivity(id);
    }

    @DeleteMapping("/delete/all")
    public ResponseDTO<Void> deleteAllActivities() {
        return activityService.deleteAllActivities();
    }
}

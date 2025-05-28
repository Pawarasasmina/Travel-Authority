package com.travelauthority.backend.controller;

import com.travelauthority.backend.dto.ActivityDTO;
import com.travelauthority.backend.dto.ResponseDTO;
import com.travelauthority.backend.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/api/v1/activity")
@CrossOrigin
@RestController
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    @PostMapping("/save")
    public ResponseDTO saveActivity(@RequestBody ActivityDTO activityDTO) {
        return activityService.saveActivity(activityDTO);
    }

    @GetMapping("/all")
    public ResponseDTO getAllActivities() {
        return activityService.getAllActivities();
    }

    @GetMapping("/{id}")
    public ResponseDTO getActivityById(@PathVariable int id) {
        return activityService.getActivityById(id);
    }

    @PutMapping("/update/{id}")
    public ResponseDTO updateActivity(@PathVariable int id, @RequestBody ActivityDTO activityDTO) {
        return activityService.updateActivity(id, activityDTO);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseDTO deleteActivity(@PathVariable int id) {
        return activityService.deleteActivity(id);
    }
}

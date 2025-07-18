package com.travelauthority.backend.service;

import com.travelauthority.backend.dto.ActivityDTO;
import com.travelauthority.backend.dto.ResponseDTO;

public interface ActivityService {
    ResponseDTO saveActivity(ActivityDTO activityDTO);
    ResponseDTO getAllActivities();
    ResponseDTO getActivityById(int id);
    ResponseDTO updateActivity(int id, ActivityDTO activityDTO);
    ResponseDTO deleteActivity(int id);
    ResponseDTO deleteAllActivities();
}

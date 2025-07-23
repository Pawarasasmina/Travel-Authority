package com.travelauthority.backend.service;

import com.travelauthority.backend.dto.ActivityDTO;
import com.travelauthority.backend.dto.ResponseDTO;

import java.util.List;

public interface ActivityService {
    ResponseDTO<ActivityDTO> saveActivity(ActivityDTO activityDTO);
    ResponseDTO<List<ActivityDTO>> getAllActivities();
    ResponseDTO<List<ActivityDTO>> getActiveActivities();
    ResponseDTO<ActivityDTO> getActivityById(int id);
    ResponseDTO<ActivityDTO> updateActivity(int id, ActivityDTO activityDTO);
    ResponseDTO<Void> deleteActivity(int id);
    ResponseDTO<Void> deleteAllActivities();
}

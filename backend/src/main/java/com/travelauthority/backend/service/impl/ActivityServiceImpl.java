package com.travelauthority.backend.service.impl;

import com.travelauthority.backend.dto.ActivityDTO;
import com.travelauthority.backend.dto.PackageDTO;
import com.travelauthority.backend.dto.ResponseDTO;
import com.travelauthority.backend.entity.Activity;
import com.travelauthority.backend.entity.Package;
import com.travelauthority.backend.repository.ActivityRepository;
import com.travelauthority.backend.repository.PackageRepository;
import com.travelauthority.backend.service.ActivityService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class ActivityServiceImpl implements ActivityService {

    @Autowired
    private ActivityRepository activityRepository;
    
    @Autowired
    private PackageRepository packageRepository;

    private ActivityDTO toDTO(Activity activity) {
        return ActivityDTO.builder()
            .id(activity.getId())
            .title(activity.getTitle())
            .location(activity.getLocation())
            .image(activity.getImage())
            .price(activity.getPrice())
            .availability(activity.getAvailability())
            .rating(activity.getRating())
            .description(activity.getDescription())
            .duration(activity.getDuration())
            .additionalInfo(activity.getAdditionalInfo())
            .highlights(activity.getHighlights())
            .categories(activity.getCategories())
            .packages(activity.getPackages() != null ? 
                activity.getPackages().stream().map(this::packageToDTO).collect(Collectors.toList()) : null)
            .active(activity.getActive())
            .build();
    }
    
    private PackageDTO packageToDTO(Package pkg) {
        return PackageDTO.builder()
            .id(pkg.getId())
            .name(pkg.getName())
            .description(pkg.getDescription())
            .price(pkg.getPrice())
            .foreignAdultPrice(pkg.getForeignAdultPrice())
            .foreignKidPrice(pkg.getForeignKidPrice())
            .localAdultPrice(pkg.getLocalAdultPrice())
            .localKidPrice(pkg.getLocalKidPrice())
            .features(pkg.getFeatures())
            // Temporarily remove images
            // .images(pkg.getImages() != null ? pkg.getImages() : new ArrayList<>())
            .build();
    }
    
    private Package packageFromDTO(PackageDTO dto, Activity activity) {
        return Package.builder()
            .id(dto.getId())
            .name(dto.getName())
            .description(dto.getDescription())
            .price(dto.getPrice())
            .foreignAdultPrice(dto.getForeignAdultPrice())
            .foreignKidPrice(dto.getForeignKidPrice())
            .localAdultPrice(dto.getLocalAdultPrice())
            .localKidPrice(dto.getLocalKidPrice())
            .features(dto.getFeatures())
            // Temporarily remove images
            // .images(dto.getImages() != null ? dto.getImages() : new ArrayList<>())
            .activity(activity)
            .build();
    }

    private Activity toEntity(ActivityDTO dto) {
        Activity activity = Activity.builder()
            .id(dto.getId())
            .title(dto.getTitle())
            .location(dto.getLocation())
            .image(dto.getImage())
            .price(dto.getPrice())
            .availability(dto.getAvailability())
            .rating(dto.getRating())
            .description(dto.getDescription())
            .duration(dto.getDuration())
            .additionalInfo(dto.getAdditionalInfo())
            .highlights(dto.getHighlights())
            .categories(dto.getCategories())
            .active(dto.getActive() != null ? dto.getActive() : true)
            .build();
            
        // Handle packages
        if (dto.getPackages() != null) {
            List<Package> packages = dto.getPackages().stream()
                .map(pkgDto -> packageFromDTO(pkgDto, activity))
                .collect(Collectors.toList());
            activity.setPackages(packages);
        }
        
        return activity;
    }

    @Override
    public ResponseDTO saveActivity(ActivityDTO activityDTO) {
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            Activity activity = toEntity(activityDTO);
            activity.setId(0); // Ensure new entity
            Activity savedActivity = activityRepository.save(activity);
            responseDTO.setData(toDTO(savedActivity));
            responseDTO.setMessage("Activity saved successfully");
            responseDTO.setStatus(HttpStatus.CREATED.toString());
        } catch (Exception e) {
            log.error("Error saving activity: {}", e.getMessage());
            responseDTO.setMessage("Error saving activity: " + e.getMessage());
            responseDTO.setStatus(HttpStatus.BAD_REQUEST.toString());
        }
        return responseDTO;
    }

    @Override
    public ResponseDTO getAllActivities() {
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            List<Activity> activities = activityRepository.findAll();
            List<ActivityDTO> dtos = activities.stream().map(this::toDTO).collect(Collectors.toList());
            responseDTO.setData(dtos);
            responseDTO.setMessage("Activities retrieved successfully");
            responseDTO.setStatus(HttpStatus.OK.toString());
        } catch (Exception e) {
            log.error("Error retrieving activities: {}", e.getMessage());
            responseDTO.setMessage("Error retrieving activities");
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
        }
        return responseDTO;
    }

    @Override
    public ResponseDTO getActivityById(int id) {
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            Optional<Activity> activity = activityRepository.findById(id);
            if (activity.isPresent()) {
                responseDTO.setData(toDTO(activity.get()));
                responseDTO.setMessage("Activity retrieved successfully");
                responseDTO.setStatus(HttpStatus.OK.toString());
            } else {
                responseDTO.setMessage("Activity not found");
                responseDTO.setStatus(HttpStatus.NOT_FOUND.toString());
            }
        } catch (Exception e) {
            log.error("Error retrieving activity: {}", e.getMessage());
            responseDTO.setMessage("Error retrieving activity");
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
        }
        return responseDTO;
    }

    @Override
    public ResponseDTO updateActivity(int id, ActivityDTO activityDTO) {
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            log.info("Attempting to update activity with id: {}", id);
            Optional<Activity> existing = activityRepository.findById(id);
            if (existing.isPresent()) {
                log.info("Found existing activity, deleting packages for activity: {}", id);
                // Delete existing packages
                packageRepository.deleteByActivityId(id);
                log.info("Packages deleted, converting DTO to entity");
                
                Activity activity = toEntity(activityDTO);
                activity.setId(id); // Ensure we're updating the existing entity
                
                log.info("Saving updated activity");
                Activity savedActivity = activityRepository.save(activity);
                responseDTO.setData(toDTO(savedActivity));
                responseDTO.setMessage("Activity updated successfully");
                responseDTO.setStatus(HttpStatus.OK.toString());
                log.info("Activity updated successfully");
            } else {
                log.warn("Activity not found with id: {}", id);
                responseDTO.setMessage("Activity not found");
                responseDTO.setStatus(HttpStatus.NOT_FOUND.toString());
            }
        } catch (Exception e) {
            log.error("Error updating activity with id {}: {}", id, e.getMessage(), e);
            responseDTO.setMessage("Error updating activity: " + e.getMessage());
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
        }
        return responseDTO;
    }

    @Override
    public ResponseDTO deleteActivity(int id) {
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            Optional<Activity> activity = activityRepository.findById(id);
            if (activity.isPresent()) {
                activityRepository.deleteById(id);
                responseDTO.setMessage("Activity deleted successfully");
                responseDTO.setStatus(HttpStatus.OK.toString());
            } else {
                responseDTO.setMessage("Activity not found");
                responseDTO.setStatus(HttpStatus.NOT_FOUND.toString());
            }
        } catch (Exception e) {
            log.error("Error deleting activity: {}", e.getMessage());
            responseDTO.setMessage("Error deleting activity");
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
        }
        return responseDTO;
    }

    @Override
    public ResponseDTO deleteAllActivities() {
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            long count = activityRepository.count();
            if (count == 0) {
                responseDTO.setMessage("No activities to delete");
                responseDTO.setStatus(HttpStatus.OK.toString());
                return responseDTO;
            }
            
            activityRepository.deleteAll();
            responseDTO.setMessage("All " + count + " activities deleted successfully");
            responseDTO.setStatus(HttpStatus.OK.toString());
            log.info("All {} activities deleted successfully", count);
        } catch (Exception e) {
            log.error("Error deleting all activities: {}", e.getMessage());
            responseDTO.setMessage("Error deleting all activities: " + e.getMessage());
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
        }
        return responseDTO;
    }
}

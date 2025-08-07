package com.travelauthority.backend.service.impl;

import com.travelauthority.backend.dto.ActivityDTO;
import com.travelauthority.backend.dto.PackageDTO;
import com.travelauthority.backend.dto.ResponseDTO;
import com.travelauthority.backend.entity.Activity;
import com.travelauthority.backend.entity.Package;
import com.travelauthority.backend.repository.ActivityRepository;
import com.travelauthority.backend.repository.BookingRepository;
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
            .createdBy(activity.getCreatedBy())
            .build();
    }
    
    private PackageDTO packageToDTO(Package pkg) {
        return PackageDTO.builder()
            .id(pkg.getId())
            .name(pkg.getName())
            .description(pkg.getDescription())
            .price(pkg.getPrice())
            .availability(pkg.getAvailability())
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
        // Log the package details for debugging
        log.debug("Converting package DTO to entity: {}", dto);
        log.info("Package {} availability: {}, type: {}", 
                 dto.getName(), 
                 dto.getAvailability(), 
                 dto.getAvailability() != null ? dto.getAvailability().getClass().getSimpleName() : "null");
        
        // Calculate the availability value to use
        Integer availabilityValue = dto.getAvailability() != null ? dto.getAvailability() : 0;
        log.info("Using availability value: {} for package {}", availabilityValue, dto.getName());
        
        // Create a builder with null checks for all fields
        Package.PackageBuilder builder = Package.builder()
            .name(dto.getName() != null ? dto.getName() : "")
            .description(dto.getDescription())
            .price(dto.getPrice() != null ? dto.getPrice() : 0.0)
            .availability(availabilityValue) // Use calculated value
            .foreignAdultPrice(dto.getForeignAdultPrice())
            .foreignKidPrice(dto.getForeignKidPrice())
            .localAdultPrice(dto.getLocalAdultPrice())
            .localKidPrice(dto.getLocalKidPrice())
            .features(dto.getFeatures())
            .activity(activity);
            
        // Only set ID if it exists and is greater than 0
        if (dto.getId() != null && dto.getId() > 0) {
            builder.id(dto.getId());
        }
            
        // Temporarily remove images
        // .images(dto.getImages() != null ? dto.getImages() : new ArrayList<>())
        
        return builder.build();
    }

    private Activity toEntity(ActivityDTO dto) {
        // Log the activity details for debugging
        log.debug("Converting activity DTO to entity: {}", dto);
        
        Activity activity = Activity.builder()
            .id(dto.getId())
            .title(dto.getTitle() != null ? dto.getTitle() : "")
            .location(dto.getLocation() != null ? dto.getLocation() : "")
            .image(dto.getImage())
            .price(dto.getPrice())
            .availability(dto.getAvailability())
            .rating(dto.getRating())
            .description(dto.getDescription() != null ? dto.getDescription() : "")
            .duration(dto.getDuration())
            .additionalInfo(dto.getAdditionalInfo())
            .highlights(dto.getHighlights())
            .categories(dto.getCategories())
            .active(dto.getActive() != null ? dto.getActive() : true)
            .createdBy(dto.getCreatedBy())
            .build();
            
        // Handle packages
        if (dto.getPackages() != null) {
            try {
                List<Package> packages = dto.getPackages().stream()
                    .filter(pkgDto -> pkgDto.getName() != null && !pkgDto.getName().isEmpty()) // Filter out empty packages
                    .map(pkgDto -> packageFromDTO(pkgDto, activity))
                    .collect(Collectors.toList());
                activity.setPackages(packages);
                log.debug("Successfully processed {} packages", packages.size());
            } catch (Exception e) {
                log.error("Error processing packages: {}", e.getMessage(), e);
                // Set empty packages list to avoid null pointer
                activity.setPackages(List.of());
            }
        } else {
            log.debug("No packages in the DTO");
            activity.setPackages(List.of());
        }
        
        return activity;
    }

    @Override
    public ResponseDTO<ActivityDTO> saveActivity(ActivityDTO activityDTO) {
        ResponseDTO<ActivityDTO> responseDTO = new ResponseDTO<>();
        try {
            // Debug logging for packages before conversion
            if (activityDTO.getPackages() != null) {
                for (PackageDTO pkg : activityDTO.getPackages()) {
                    log.info("Received package DTO: {} with availability: {}", pkg.getName(), pkg.getAvailability());
                }
            }
            
            Activity activity = toEntity(activityDTO);
            activity.setId(0); // Ensure new entity
            
            // Debug logging after conversion to entity
            if (activity.getPackages() != null) {
                for (Package pkg : activity.getPackages()) {
                    log.info("Converted package entity: {} with availability: {}", pkg.getName(), pkg.getAvailability());
                }
            }
            
            Activity savedActivity = activityRepository.save(activity);
            responseDTO.setData(toDTO(savedActivity));
            responseDTO.setMessage("Activity saved successfully");
            responseDTO.setStatus("CREATED");
            responseDTO.setSuccess(true);
        } catch (Exception e) {
            log.error("Error saving activity: {}", e.getMessage());
            responseDTO.setMessage("Error saving activity: " + e.getMessage());
            responseDTO.setStatus(HttpStatus.BAD_REQUEST.toString());
            responseDTO.setSuccess(false);
        }
        return responseDTO;
    }

    @Override
    public ResponseDTO<List<ActivityDTO>> getAllActivities() {
        ResponseDTO<List<ActivityDTO>> responseDTO = new ResponseDTO<>();
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
            responseDTO.setSuccess(false);
        }
        return responseDTO;
    }
    
    @Override
    public ResponseDTO<List<ActivityDTO>> getActiveActivities() {
        ResponseDTO<List<ActivityDTO>> responseDTO = new ResponseDTO<>();
        try {
            List<Activity> activities = activityRepository.findByActiveTrue();
            List<ActivityDTO> dtos = activities.stream().map(this::toDTO).collect(Collectors.toList());
            responseDTO.setData(dtos);
            responseDTO.setMessage("Active activities retrieved successfully");
            responseDTO.setStatus(HttpStatus.OK.toString());
            responseDTO.setSuccess(true);
        } catch (Exception e) {
            log.error("Error retrieving active activities: {}", e.getMessage());
            responseDTO.setMessage("Error retrieving active activities");
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
            responseDTO.setSuccess(false);
        }
        return responseDTO;
    }

    @Override
    public ResponseDTO<ActivityDTO> getActivityById(int id) {
        ResponseDTO<ActivityDTO> responseDTO = new ResponseDTO<>();
        try {
            Optional<Activity> activity = activityRepository.findById(id);
            if (activity.isPresent()) {
                responseDTO.setData(toDTO(activity.get()));
                responseDTO.setMessage("Activity retrieved successfully");
                responseDTO.setStatus(HttpStatus.OK.toString());
            } else {
                responseDTO.setMessage("Activity not found");
                responseDTO.setStatus(HttpStatus.NOT_FOUND.toString());
                responseDTO.setSuccess(false);
            }
        } catch (Exception e) {
            log.error("Error retrieving activity: {}", e.getMessage());
            responseDTO.setMessage("Error retrieving activity");
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
            responseDTO.setSuccess(false);
        }
        return responseDTO;
    }

    @Override
    @Transactional
    public ResponseDTO<ActivityDTO> updateActivity(int id, ActivityDTO activityDTO) {
        ResponseDTO<ActivityDTO> responseDTO = new ResponseDTO<>();
        try {
            log.info("Attempting to update activity with id: {}", id);
            Optional<Activity> existing = activityRepository.findById(id);
            if (existing.isPresent()) {
                log.info("Found existing activity, deleting packages for activity: {}", id);
                try {
                    // Delete existing packages
                    packageRepository.deleteByActivityId(id);
                    log.info("Packages deleted successfully");
                } catch (Exception e) {
                    log.error("Error deleting packages: {}", e.getMessage(), e);
                    // Continue with the update even if package deletion fails
                }
                
                log.info("Converting DTO to entity");
                
                // Create a new activity object but preserve certain fields from existing
                Activity existingActivity = existing.get();
                Activity activity = toEntity(activityDTO);
                activity.setId(id); // Ensure we're updating the existing entity
                
                // Preserve createdBy if not provided in the update
                if ((activityDTO.getCreatedBy() == null || activityDTO.getCreatedBy().isEmpty()) && 
                    existingActivity.getCreatedBy() != null) {
                    activity.setCreatedBy(existingActivity.getCreatedBy());
                    log.info("Preserved existing creator: {}", existingActivity.getCreatedBy());
                }
                
                // If packages are null in the DTO but exist in the DB, don't update packages
                if (activityDTO.getPackages() == null && existingActivity.getPackages() != null) {
                    activity.setPackages(existingActivity.getPackages());
                }
                
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
                responseDTO.setSuccess(false);
            }
        } catch (Exception e) {
            log.error("Error updating activity with id {}: {}", id, e.getMessage(), e);
            responseDTO.setMessage("Error updating activity: " + e.getMessage());
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
            responseDTO.setSuccess(false);
        }
        return responseDTO;
    }

    @Override
    public ResponseDTO<Void> deleteActivity(int id) {
        ResponseDTO<Void> responseDTO = new ResponseDTO<>();
        try {
            Optional<Activity> activity = activityRepository.findById(id);
            if (activity.isPresent()) {
                activityRepository.deleteById(id);
                responseDTO.setMessage("Activity deleted successfully");
                responseDTO.setStatus(HttpStatus.OK.toString());
            } else {
                responseDTO.setMessage("Activity not found");
                responseDTO.setStatus(HttpStatus.NOT_FOUND.toString());
                responseDTO.setSuccess(false);
            }
        } catch (Exception e) {
            log.error("Error deleting activity: {}", e.getMessage());
            responseDTO.setMessage("Error deleting activity: " + e.getMessage());
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
            responseDTO.setSuccess(false);
        }
        return responseDTO;
    }

    @Override
    public ResponseDTO<Void> deleteAllActivities() {
        ResponseDTO<Void> responseDTO = new ResponseDTO<>();
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
            log.error("Error deleting all activities: {}", e.getMessage(), e);
            responseDTO.setMessage("Error deleting all activities: " + e.getMessage());
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
            responseDTO.setSuccess(false);
        }
        return responseDTO;
    }
    
    @Override
    public ResponseDTO<List<ActivityDTO>> getActivitiesByOwner(String ownerEmail) {
        ResponseDTO<List<ActivityDTO>> responseDTO = new ResponseDTO<>();
        try {
            log.info("Retrieving activities for owner: {}", ownerEmail);
            List<Activity> activities = activityRepository.findByCreatedBy(ownerEmail);
            List<ActivityDTO> dtos = activities.stream().map(this::toDTO).collect(Collectors.toList());
            responseDTO.setData(dtos);
            responseDTO.setMessage("Owner activities retrieved successfully");
            responseDTO.setStatus(HttpStatus.OK.toString());
            responseDTO.setSuccess(true);
            log.info("Retrieved {} activities for owner {}", dtos.size(), ownerEmail);
        } catch (Exception e) {
            log.error("Error retrieving owner activities: {}", e.getMessage());
            responseDTO.setMessage("Error retrieving owner activities");
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
            responseDTO.setSuccess(false);
        }
        return responseDTO;
    }
    
    @Override
    public ResponseDTO<List<ActivityDTO>> getActiveActivitiesByOwner(String ownerEmail) {
        ResponseDTO<List<ActivityDTO>> responseDTO = new ResponseDTO<>();
        try {
            log.info("Retrieving active activities for owner: {}", ownerEmail);
            List<Activity> activities = activityRepository.findByCreatedByAndActiveTrue(ownerEmail);
            List<ActivityDTO> dtos = activities.stream().map(this::toDTO).collect(Collectors.toList());
            responseDTO.setData(dtos);
            responseDTO.setMessage("Active owner activities retrieved successfully");
            responseDTO.setStatus(HttpStatus.OK.toString());
            responseDTO.setSuccess(true);
            log.info("Retrieved {} active activities for owner {}", dtos.size(), ownerEmail);
        } catch (Exception e) {
            log.error("Error retrieving active owner activities: {}", e.getMessage());
            responseDTO.setMessage("Error retrieving active owner activities");
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
            responseDTO.setSuccess(false);
        }
        return responseDTO;
    }
}

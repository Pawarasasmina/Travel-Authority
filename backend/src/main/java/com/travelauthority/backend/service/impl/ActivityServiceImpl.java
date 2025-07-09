package com.travelauthority.backend.service.impl;

import com.travelauthority.backend.dto.ActivityDTO;
import com.travelauthority.backend.dto.ActivityPackageDTO;
import com.travelauthority.backend.dto.ResponseDTO;
import com.travelauthority.backend.entity.Activity;
import com.travelauthority.backend.entity.ActivityPackage;
import com.travelauthority.backend.repository.ActivityRepository;
import com.travelauthority.backend.service.ActivityService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ActivityServiceImpl implements ActivityService {

    @Autowired
    private ActivityRepository activityRepository;
    @Autowired
    private com.travelauthority.backend.repository.ActivityPackageRepository activityPackageRepository;

    private ActivityDTO toDTO(Activity activity) {
        List<ActivityPackageDTO> packageDTOs = null;
        if (activity.getPackages() != null) {
            packageDTOs = activity.getPackages().stream().map(pkg -> new ActivityPackageDTO(
                pkg.getId(),
                pkg.getName(),
                pkg.getKeyIncludes(),
                pkg.getPriceForeignAdult(),
                pkg.getPriceForeignKid(),
                pkg.getPriceLocalAdult(),
                pkg.getPriceLocalKid(),
                pkg.getOpeningTime(),
                pkg.getAverageTime()
            )).collect(Collectors.toList());
        }
        return new ActivityDTO(
            activity.getId(),
            activity.getTitle(),
            activity.getLocation(),
            activity.getImages(),
            activity.getKeyPoints(),
            activity.getDescription(),
            activity.isActive(),
            packageDTOs
        );
    }

    private Activity toEntity(ActivityDTO dto) {
        Activity activity = new Activity();
        activity.setId(dto.getId());
        activity.setTitle(dto.getTitle());
        activity.setLocation(dto.getLocation());
        activity.setImages(dto.getImages());
        activity.setKeyPoints(dto.getKeyPoints());
        activity.setDescription(dto.getDescription());
        activity.setActive(dto.isActive());
        if (dto.getPackages() != null) {
            List<ActivityPackage> packages = dto.getPackages().stream().map(pkgDto -> {
                ActivityPackage pkg = new ActivityPackage();
                pkg.setId(pkgDto.getId());
                pkg.setName(pkgDto.getName());
                pkg.setKeyIncludes(pkgDto.getKeyIncludes());
                pkg.setPriceForeignAdult(pkgDto.getPriceForeignAdult());
                pkg.setPriceForeignKid(pkgDto.getPriceForeignKid());
                pkg.setPriceLocalAdult(pkgDto.getPriceLocalAdult());
                pkg.setPriceLocalKid(pkgDto.getPriceLocalKid());
                pkg.setOpeningTime(pkgDto.getOpeningTime());
                pkg.setAverageTime(pkgDto.getAverageTime());
                pkg.setActivity(activity);
                return pkg;
            }).collect(Collectors.toList());
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
            activityRepository.save(activity);
            responseDTO.setMessage("Activity saved successfully");
            responseDTO.setStatus(HttpStatus.CREATED.toString());
        } catch (Exception e) {
            log.error("Error saving activity: {}", e.getMessage());
            responseDTO.setMessage("Error saving activity");
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
            Optional<Activity> existing = activityRepository.findById(id);
            if (existing.isPresent()) {
                Activity activity = existing.get();
                activity.setTitle(activityDTO.getTitle());
                activity.setLocation(activityDTO.getLocation());
                activity.setImages(activityDTO.getImages());
                activity.setKeyPoints(activityDTO.getKeyPoints());
                activity.setDescription(activityDTO.getDescription());
                activity.setActive(activityDTO.isActive());
                activityRepository.save(activity);
                responseDTO.setData(toDTO(activity));
                responseDTO.setMessage("Activity updated successfully");
                responseDTO.setStatus(HttpStatus.OK.toString());
            } else {
                responseDTO.setMessage("Activity not found");
                responseDTO.setStatus(HttpStatus.NOT_FOUND.toString());
            }
        } catch (Exception e) {
            log.error("Error updating activity: {}", e.getMessage());
            responseDTO.setMessage("Error updating activity");
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
}

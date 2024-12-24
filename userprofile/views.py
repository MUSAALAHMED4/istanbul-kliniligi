from django.shortcuts import render
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

# csrf_exempt decorator is used to disable csrf protection for the view
@csrf_exempt
def reset_password(request):
    if request.method != 'POST':
        # return json response with error message
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=405)
    # get the user id and old password and new password from the request body 
    request_body = json.loads(request.body)
    user_id = request_body.get('user_id')
    old_password = request_body.get('old_password')
    new_password = request_body.get('new_password')

    # get the user object from the user id
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        # return json response with error message
        return JsonResponse({'error': 'User not found'}, status=404)
    
    # check if the old password is correct
    if not user.check_password(old_password):
        # return json response with error message
        return JsonResponse({'error': 'Old password is incorrect'}, status=400)
    
    # set the new password
    user.set_password(new_password)
    user.save()

    # return json response with success message
    return JsonResponse({'message': 'Password updated successfully'}, status=200)
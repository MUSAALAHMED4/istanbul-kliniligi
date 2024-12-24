from django.shortcuts import render, redirect
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from event.models import Event, Shift
from doktor.models import Doktor
from hasta.models import Family
from support.models import Support, SupportType
from .serializers import EventSerializer, ShiftSerializer, QueueSerializer
from .models import Event, Shift, Queue, QueuePage
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import datetime


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = EventSerializer
    http_method_names = ['get', 'post', 'put']

    @action(detail=False, methods=['post'], url_path='create', url_name='create')
    def create_event(self, request):
        support_type_id = request.data.get('support_type')
        name = request.data.get('name')
        distribution_days = request.data.get('distribution_days')
        budget = request.data.get('budget', None)
        if budget:
            budget = float(budget)
        else:
            budget = None
        number_of_families = request.data.get('number_of_families')
        if number_of_families:
            number_of_families = int(number_of_families)
        else:
            number_of_families = None

        number_of_families_per_shift = request.data.get('number_of_families_per_shift')
        if number_of_families_per_shift:
            number_of_families_per_shift = int(number_of_families_per_shift)
        else:
            number_of_families_per_shift = None
        
        rows_per_page = request.data.get('number_of_families_per_queue')
        if rows_per_page:
            rows_per_page = int(rows_per_page)
        else:
            rows_per_page = None

        try:
            support_type = SupportType.objects.get(pk=support_type_id)
        except SupportType.DoesNotExist:
            return Response({"error": "Invalid support type"}, status=status.HTTP_400_BAD_REQUEST)
        
        families = Family.objects.order_by('title').all()

        event = Event.objects.create(
            support_type=support_type,
            name=name,
            budget=budget,
            number_of_families=number_of_families,
            number_of_families_per_shift=number_of_families_per_shift,
            rows_per_page=rows_per_page
        )

        for day_info in distribution_days:
            event_date = day_info.get('day')
            shifts_info = day_info.get('shifts', [])

            for shift_info in shifts_info:
                start_time = datetime.strptime(f"{event_date} {shift_info.get('start')}", "%Y-%m-%d %H:%M")
                end_time = datetime.strptime(f"{event_date} {shift_info.get('end')}", "%Y-%m-%d %H:%M")
                doktors = shift_info.get('doktors', [])
                shift = Shift.objects.create(event=event, start_time=start_time, end_time=end_time)
                shift.doktors.set(doktors)

                queues_info = shift_info.get('queues', [])
            total_queues = len(queues_info)
            family_index = 0

            for index, queue_info in enumerate(queues_info):
                queue = Queue.objects.create(shift=shift, name=f"Table {index+1}")
                queue.doktors.set(queue_info.get('doktors', []))
                
                range_number = (number_of_families_per_shift // total_queues) // rows_per_page or 1
                for page_number in range(range_number):
                    queue_page = QueuePage.objects.create(queue=queue, page_number=page_number+1)

                    for _ in range(rows_per_page):
                        if family_index < len(families):
                            family = families[family_index]
                            queue_page.families.add(family)
                            family_index += 1
                        else:
                            break

                    queue_page.save()

        serializer = EventSerializer(event)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    

    @action(detail=True, methods=['put'], url_path='edit', url_name='edit')
    def edit_event(self, request, pk=None):
        event = Event.objects.get(pk=pk)
        support_type_id = request.data.get('support_type')
        name = request.data.get('name')
        distribution_days = request.data.get('distribution_days')
        budget = request.data.get('budget', None)
        if budget:
            budget = float(budget)
        number_of_families = int(request.data.get('number_of_families', 0))
        number_of_families_per_shift = int(request.data.get('number_of_families_per_shift', 0))
        rows_per_page = int(request.data.get('number_of_families_per_queue', 0))

        try:
            support_type = SupportType.objects.get(pk=support_type_id)
        except SupportType.DoesNotExist:
            return Response({"error": "Invalid support type"}, status=status.HTTP_400_BAD_REQUEST)
        
        families = Family.objects.order_by('title').all()

        event.support_type = support_type
        event.name = name
        event.budget = budget
        event.number_of_families = number_of_families
        event.number_of_families_per_shift = number_of_families_per_shift
        event.rows_per_page = rows_per_page
        event.save()

        for day_info in distribution_days:
            event_date = day_info.get('day')
            shifts_info = day_info.get('shifts', [])

            for shift_info in shifts_info:
                start_time = datetime.strptime(f"{event_date} {shift_info.get('start')}", "%Y-%m-%d %H:%M")
                end_time = datetime.strptime(f"{event_date} {shift_info.get('end')}", "%Y-%m-%d %H:%M")
                doktors = shift_info.get('doktors', [])
                shift = Shift.objects.create(event=event, start_time=start_time, end_time=end_time)
                shift.doktors.set(doktors)

                queues_info = shift_info.get('queues', [])
            total_queues = len(queues_info)
            family_index = 0

            for index, queue_info in enumerate(queues_info):
                queue = Queue.objects.create(shift=shift, name=f"Table {index+1}")
                queue.doktors.set(queue_info.get('doktors', []))

                for page_number in range((number_of_families_per_shift // total_queues) // rows_per_page):
                    queue_page = QueuePage.objects.create(queue=queue, page_number=page_number+1)

                    for _ in range(rows_per_page):
                        if family_index < len(families):
                            family = families[family_index]
                            queue_page.families.add(family)
                            family_index += 1
                        else:
                            break

                    queue_page.save()

        serializer = EventSerializer(event)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ShiftViewSet(viewsets.ModelViewSet):
    queryset = Shift.objects.all()
    permissions_classes = [IsAuthenticated]
    serializer_class = ShiftSerializer
    http_method_names = ['get']


class QueueViewSet(viewsets.ModelViewSet):
    queryset = Queue.objects.all()
    permissions_classes = [IsAuthenticated]
    serializer_class = QueueSerializer
    http_method_names = ['get']
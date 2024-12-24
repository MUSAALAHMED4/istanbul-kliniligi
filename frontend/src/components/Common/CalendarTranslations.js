import React from "react";
import { useTranslation } from "react-i18next";

const CalendarTranslations = () => {
  const { t } = useTranslation();

  return {
    shortDays: [
      t("Sun"),
      t("Mon"),
      t("Tue"),
      t("Wed"),
      t("Thu"),
      t("Fri"),
      t("Sat"),
  ],
  
  
    longhand: [
      t("calendar.days.0"),
      t("calendar.days.1"),
      t("calendar.days.2"),
      t("calendar.days.3"),
      t("calendar.days.4"),
      t("calendar.days.5"),
      t("calendar.days.6"),
    ],
    months: [
      t("1 | January"),
      t("2 | February"),
      t("3 | March"),
      t("4 | April"),
      t("5 | May"),
      t("6 | June"),
      t("7 | July"),
      t("8 | August"),
      t("9 | September"),
      t("10 | October"),
      t("11 | November"),
      t("12 | December"),
  ],
  
  };
};

export default CalendarTranslations;
